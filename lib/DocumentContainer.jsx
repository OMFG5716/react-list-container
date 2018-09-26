import { Meteor } from 'meteor/meteor';

import React, { cloneElement, Component } from 'react';
import PropTypes from 'prop-types'; // ES6

const createReactClass = require('create-react-class');

const Subs = new SubsManager();

const DocumentContainer = createReactClass({

  mixins: [ReactMeteorData],

  getMeteorData() {

    // subscribe if necessary
    if (this.props.publication) {
      const subscribeFunction = this.props.cacheSubscription ? Subs.subscribe.bind(Subs) : Meteor.subscribe;
      const subscription = subscribeFunction(this.props.publication, this.props.terms);
    }

    const collection = this.props.collection;
    const document = collection.findOne(this.props.selector);

    // look for any specified joins
    if (document && this.props.joins) {

      // loop over each join
      this.props.joins.forEach((join) => {

        if (join.foreignProperty) {
          // foreign join (e.g. comments belonging to a post)

          // get the property containing the id
          const foreignProperty = document[join.foreignProperty];
          const joinSelector = {};
          joinSelector[join.foreignProperty] = document._id;
          document[join.joinAs] = collection.find(joinSelector);

        } else {
          // local join (e.g. a post's upvoters)

          // get the property containing the id or ids
          const joinProperty = document[join.localProperty];
          const collection = typeof join.collection === 'function' ? join.collection() : join.collection;

          // perform the join
          if (Array.isArray(joinProperty)) { // join property is an array of ids
            document[join.joinAs] = collection.find({ _id: { $in: joinProperty } }).fetch();
          } else { // join property is a single id
            document[join.joinAs] = collection.findOne({ _id: joinProperty });
          }
        }

      });

    }

    const data = {
      currentUser: Meteor.user(),
    };

    data[this.props.documentPropName] = document;

    return data;
  },

  render() {
    const loadingComponent = this.props.loading ? this.props.loading : <p>Loading…</p>;

    if (this.data[this.props.documentPropName]) {
      if (this.props.component) {
        const Component = this.props.component;
        return <Component {...this.props.componentProps} {...this.data} collection={this.props.collection} />;
      }
      return cloneElement(this.props.children, { ...this.props.componentProps, ...this.data, collection: this.props.collection });

    }
    return loadingComponent;

  },

});


DocumentContainer.propTypes = {
  collection: PropTypes.object.isRequired,
  selector: PropTypes.object.isRequired,
  publication: PropTypes.string,
  terms: PropTypes.any,
  joins: PropTypes.array,
  loading: PropTypes.func,
  component: PropTypes.func,
  componentProps: PropTypes.object,
  documentPropName: PropTypes.string,
  cacheSubscription: PropTypes.bool,
};

DocumentContainer.defaultProps = {
  documentPropName: 'document',
  cacheSubscription: false,
};

export default DocumentContainer;
