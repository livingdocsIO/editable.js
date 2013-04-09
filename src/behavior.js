var behavior = (function() {
  return {
    focus: function(element) {
      console.log('Default focus behavior');
    },

    blur: function(element) {
      console.log('Default blur behavior');
    },

    flow: function(element, action) {
      console.log('Default flow behavior');
    },

    selection: function(element, selection) {
      console.log('Default selection behavior');
    },

    cursor: function(element, cursor) {
      console.log('Default cursor behavior');
    },

    newline: function(element, cursor) {
      console.log('Default newline behavior');
    },

    insert: function(element, direction) {
      console.log('Default insert behavior');
    },

    split: function(element, before, after) {
      console.log('Default split behavior');
    },

    merge: function(element, direction) {
      console.log('Default merge behavior');
    },

    empty: function(element) {
      console.log('Default empty behavior');
    },

    'switch': function(element, direction) {
      console.log('Default switch behavior');
    },

    move: function(element, selection, direction) {
      console.log('Default move behavior');
    },

    clipboard: function(element, selection, action) {
      console.log('Default clipboard behavior');
    }
  };
})();
