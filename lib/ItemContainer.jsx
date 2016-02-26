ItemContainer = React.createClass({

  propTypes: {
    collection: React.PropTypes.object.isRequired,
    selector: React.PropTypes.object.isRequired,
    publication: React.PropTypes.string,
    terms: React.PropTypes.object,
    joins: React.PropTypes.array,
    loading: React.PropTypes.func
  },

  mixins: [ReactMeteorData],
  
  getMeteorData() {

    // subscribe if necessary
    if (this.props.publication) {
      const subscription = Meteor.subscribe(this.props.publication, this.props.terms);
    }

    const collection = this.props.collection;
    const document = collection.findOne(this.props.selector);
    
    // look for any specified joins
    if (document && this.props.joins) {

      // loop over each join
      this.props.joins.forEach(join => {

        // get the property containing the id or ids
        const joinProperty = document[join.property];
        const collection = typeof join.collection === "function" ? join.collection() : join.collection;

        // perform the join
        if (Array.isArray(joinProperty)) { // join property is an array of ids
          document[join.joinAs] = collection.find({_id: {$in: joinProperty}}).fetch();
        } else { // join property is a single id
          document[join.joinAs] = collection.findOne({_id: joinProperty});
        }
          
      });

    }

    return {
      document: document,
      currentUser: Meteor.user()
    };
  },

  render() {
    const loadingComponent = this.props.loading ? this.props.loading : <p>Loading…</p>
    if (this.data.document) {
      return React.cloneElement(this.props.children, { ...this.data, collection: this.props.collection });
    } else {
      return loadingComponent;
    }
  }

});

// module.exports = ItemContainer;
export default ItemContainer;