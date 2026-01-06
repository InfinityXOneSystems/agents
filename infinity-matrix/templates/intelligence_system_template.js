// Intelligence System Template
// Provides a reusable template for creating intelligence-gathering systems.

class IntelligenceSystemTemplate {
  constructor() {
    this.components = [];
  }

  addComponent(component) {
    console.log('Adding component to template...');
    this.components.push(component);
  }

  getTemplate() {
    return this.components;
  }
}

const intelligenceSystemTemplate = new IntelligenceSystemTemplate();

module.exports = intelligenceSystemTemplate;