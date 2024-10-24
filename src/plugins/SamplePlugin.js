class SamplePlugin {
  constructor() {
    this.name = 'Sample Plugin';
  }

  initialize() {
    console.log(`<From Plugin "${this.name}"> : loaded and initialized. 🎉🎊🥳`);
  }

  // Add any other methods or properties as needed
}

module.exports = SamplePlugin;
