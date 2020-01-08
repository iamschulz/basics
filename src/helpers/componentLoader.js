/**
 * Usage:
 * Create a new HTML and JS file with the same name in ../components/fooBar/fooBar.[html|js]
 * Use following pattern:
 *  
 * html:
 *    <div data-component="fooBar">
 *        <span data-foo-bar-el="loremIpsum">
 *            <!-- content here -->
 *        </span>
 *    </div>
 *  
 * js:
 *    import Component from '../../helpers/component';
 *    export default class FooBar extends Component {
 *        prepare() {
 *            // prepare component
 *        }
 *        init() {
 *            // the component wrapper is this.el
 *            // registered DOM elements are assigned like this.loremIpsum
 *            // business logic here
 *        }
 *    }
 *  
 */

export default class ComponentLoader {
    constructor() {
        this.components = [];
        this.els = document.querySelectorAll('[data-component]');
        this.lastId = 0;

        this.updateDom();
    }

    updateDom() {
        this.els.forEach((el) => {
            if (!window.ComponentLoader 
                || !window.ComponentLoader.components.filter(x => x.component.el === el)) {
                this.registerComponent(el);
            }
        });
    }

    registerComponent(el) {
        try {
            const componentName = el.dataset.component;
            this.fetchComponent(componentName).then(Module => {
                this.initializeComponent(Module, el);
            });
        } catch (error) {
            console.error('Component couldn\'t be initialized', el, error);
        }
    }

    fetchComponent(componentName) {
        return import(`../components/${componentName}/${componentName}.js`);
    }

    initializeComponent(Module, el) {
        const id = this.lastId;
        const initializedComponent = new Module.default(el);

        this.lastId = this.lastId + 1;
        initializedComponent.startComponent();
        this.components.push({
            id,
            component: initializedComponent,
        });
    }

    removeComponent(el) {
        const componentObj = Object
            .values(this.components)
            .filter((comp) => comp.component.el === el)[0];

        if (componentObj) {
            if (componentObj.component.destroy) {
                componentObj.component.destroy();
            }

            componentObj.component.el
                .querySelectorAll('[data-component]')
                .forEach((subcomponent) => {
                    this.removeComponent(subcomponent);
                });

            delete this.components[componentObj.id];
        }
    }
}
