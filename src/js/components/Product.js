import { select, classNames, templates} from './../settings.js';
import AmountWidget from './AmountWidget.js';
import utils from './../utils.js';
  
class Product {
  constructor(id, data){
    const thisProduct = this;

    thisProduct.id = id;
    thisProduct.data = data;

    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();
    // console.log('new Product: ', thisProduct);
  }

  renderInMenu(){
    const thisProduct = this;
    /* generate HTML based on template*/
    const generatedHTML = templates.menuProduct(thisProduct.data);
    /* create element using utils.createDOMFromHTML */
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);
    /* find menu container */
    const menuContainer = document.querySelector(select.containerOf.menu);
    /* add element to menu */
    menuContainer.appendChild(thisProduct.element);
  }

  getElements(){
    const thisProduct = this;
    
    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
  } 

  initAccordion(){
    const thisProduct = this;
                
    /* START: click event listener to trigger */
    thisProduct.accordionTrigger.addEventListener('click', function(event){       
    /* prevent default action for event */
      event.preventDefault();
      /* toggle active class on element of thisProduct */
      thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
        
      /* find all active products */
      const allActiveProducts = document.querySelectorAll(select.all.menuProductsActive);
        
      /* START LOOP: for each active product */
      for(let product of allActiveProducts){
        /* START: if the active product isn't the element of thisProduct */
        if(product !== thisProduct.element){
        /* remove class active for the active product */
          product.classList.remove(classNames.menuProduct.wrapperActive);
        /* END: if the active product isn't the element of thisProduct */
        }
        /* END LOOP: for each active product */
      }
      /* END: click event listener to trigger */
    });
  }

  initOrderForm(){
    const thisProduct = this;
      
    thisProduct.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisProduct.processOrder();
    });

    for(let input of thisProduct.formInputs){
      input.addEventListener('change', function(){
        thisProduct.processOrder();
      });
    }

    thisProduct.cartButton.addEventListener('click', function(event){
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });
  }

  processOrder(){
    const thisProduct = this;
    const formData = utils.serializeFormToObject(thisProduct.form);

    thisProduct.params = {};
    let price = thisProduct.data.price;
    // console.log('formData: ', formData);
            
    /* START LOOP for each params (thisProduct.data.params) */
    for(let paramId in thisProduct.data.params){
      const param = thisProduct.data.params[paramId];
      // console.log('param: ', param);
        
      /* START LOOP for each params.options */
      for(let optionId in param.options){
        const option = param.options[optionId];
                    
        // const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
        const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;
        /* START IF: if option is selected and option is not default */
        if(optionSelected && !option.default){
        /* add price of option to variable price */
          price += option.price;
        /* START ELSE IF: if option is not selected and option is default */
        } else if(!optionSelected && option.default){
        /* deduct price of option from price */
          price -= option.price;
        }
          
        /* Create selector for each product */
        const selector = '.' + paramId + '-' + optionId; 
        /* Select all images with the selector above */
        const images = thisProduct.imageWrapper.querySelectorAll(selector);
          
        /* START IF selected option */
        if(optionSelected){
          if(!thisProduct.params[paramId]){
            thisProduct.params[paramId] = {
              label: param.label,
              options: {},
            };
          }
          thisProduct.params[paramId].options[optionId] = option.label;
          /* START FOR each image */
          for(let image of images){
            /* add 'active' class */
            image.classList.add(classNames.menuProduct.imageVisible);
            /* END FOR each image */
          }
          /* START ELSE (if option not selected)*/
        } else {
        /* START FOR each image */
          for(let image of images){
            /* remove class 'active' */
            image.classList.remove(classNames.menuProduct.imageVisible);
            /* END FOR each image */  
          }
          /* END ELSE */    
        }
      }
    }
    /* multiply price by amount */
    thisProduct.priceSingle = price;
    thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;

    /* set the contents of thisProduct.priceElem to be the value of variable price */
    thisProduct.priceElem.innerHTML = thisProduct.price;  
    // console.log('thisProduct.params', thisProduct.params);  
  }    
    
  initAmountWidget(){
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
    thisProduct.amountWidgetElem.addEventListener('updated', function(){
      thisProduct.processOrder();
    });
  }

  addToCart(){
    const thisProduct = this;
    thisProduct.name = thisProduct.data.name;
    thisProduct.amount = thisProduct.amountWidget.value;


    //app.cart.add(thisProduct);

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct,
      },

      
    });
    thisProduct.element.dispatchEvent(event);
  }
}

export default Product;