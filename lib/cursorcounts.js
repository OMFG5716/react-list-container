CursorCounts = {};

if (Meteor.isClient) {

  CursorCounts = {

    // on the client, we'll store counts in a Minimongo collection
    collection: new Mongo.Collection("cursorcounts"),

    // define getter
    get(terms) {

      // note: countDoc might initially not be found if subscription
      // data hasn't yet been loaded
      const cursorId = this.getCursorId(terms);
      const countDoc = CursorCounts.collection.findOne(cursorId);
      return countDoc && countDoc.count;

    }

  }

  // subscribe to cursorcounts publication
  Meteor.subscribe('cursorcounts');

}

if (Meteor.isServer) {

  CursorCounts = {

    // subscription will be set once we actually subscribe
    // to the "cursorcounts" publication
    subscription: null,

    // on the server, store counts in an array
    counts: [],

    // define setter
    set(terms, count) {
      const cursorId = this.getCursorId(terms);
      if (this.subscription) {
        this.subscription.added("cursorcounts", cursorId, {count: count});
      }
      this.counts[cursorId] = count;
    },

    // define getter (for SSR)
    get(terms) {
      const cursorId = this.getCursorId(terms);
      return this.counts[cursorId];
    }
  };

  // publish cursorcounts publication
  Meteor.publish('cursorcounts', function() {
    const self = this;
    CursorCounts.subscription = self;
    self.ready();
  });
}

// generate unique cursor ID based on subscription terms
CursorCounts.getCursorId = (terms) => {
  terms = _.clone(terms);
  delete terms.currentUserId;
  return JSON.stringify(terms);
};

export default CursorCounts;
