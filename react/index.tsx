import { canUseDOM } from 'vtex.render-runtime'

import { PixelMessage } from './typings/events'

export function handleEvents(e: PixelMessage) {
  var _ra: any = _ra || {};

  if (_ra !== {} && _ra.ready)
    switch (e.data.eventName) {
      case 'vtex:userData': {
        _ra.setEmail({
          email: e.data.email,
          name: e.data.firstName + ' ' + e.data.lastName,
          phone: e.data.phone,
        });
        break
      }
      case 'vtex:addToCart': {
        const { items } = e.data;

        let itemId = items[0].productId;
        let quantity = items[0].quantity;
        let variation = false;

        _ra.addToCart(itemId, quantity, variation);
        break
      }
      case 'vtex:categoryView': {
        const { category, pageUrl, parentId, parents } = e.data;

        let parent = parentId ? parentId : false;
        let breadcrumb: any = [];

        if (parent !== false) {
          parents.map(parentMetaData => {
            breadcrumb.push({ ...parentMetaData, 'parent': false });
          })
        }
        
        _ra.sendCategory(category.id, category.name, pageUrl, parent, breadcrumb);
        break
      }
      case 'vtex:orderPlaced': {
        const { transactionProducts } = e.data;

        let checkoutIds: any = [];

        transactionProducts.map((product: any) => {
          if (product.id) checkoutIds.push(product.id);
        });

        _ra.checkoutIds(checkoutIds);
        break
      }
      case 'vtex:orderPlacedTracked': {
        let saveOrderInfo = {
          'order_no': e.data.transactionId,
          'lastname': e.data.lastName,
          'firstname': e.data.firstName,
          'email': e.data.email,
          'phone': e.data.visitorContactPhone,
          'state': e.data.visitorAddressState,
          'city': e.data.visitorAddressCity,
          'address': e.data.visitorAddressStreet + ' ' + e.data.visitorAddressNumber,
          'discount_code': [e.data.coupon],
          'discount': e.data.transactionDiscounts,
          'shipping': e.data.transactionShipping,
          'rebates': 0,
          'fees': e.data.transactionTax,
          'total': e.data.transactionTotal
        };

        let saveOrderProducts: any = [];

        e.data.transactionProducts.map((product: any) => {
          saveOrderProducts.push({ id: product.id, name: product.name, price: product.price, variation_code: product.skuName })
        });

        _ra.saveOrder(saveOrderInfo, saveOrderProducts);
        break;
      }
      case 'vtex:productView': {
        const { product } = e.data;

        _ra.sendProduct(
          {
            id: product.productId,
            name: product.productName,
            url: product.detailUrl,
            img: product.selectedSku.imageUrl,
            price: product.offer.Price,
            promo: 0,
            stock: product.offer.AvailableQuantity,
            brand: {
              id: product.brandId,
              name: product.brand
            },
            category: {
              id: product.categoryId,
              name: product.categories,
              parent: false,
              breadcrumb: []
            },
          }
        );
        break
      }
      default: break
    }
}

if (canUseDOM) {
  window.addEventListener('message', handleEvents)
}
