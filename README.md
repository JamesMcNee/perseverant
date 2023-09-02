<h1 align="center">Welcome to PersevereJS 👋</h1>
<p>
  <a href="#" target="_blank">
    <img alt="Build" src="https://github.com/JamesMcNee/persevere-js/actions/workflows/main.yml/badge.svg" />
  </a>
  <a href="https://www.npmjs.com/package/persevere-js" target="_blank">
    <img alt="Version" src="https://badge.fury.io/js/persevere-js.svg" />
  </a>
  <a href="https://github.com/JamesMcNee/persevere-js#readme" target="_blank">
    <img alt="Documentation" src="https://img.shields.io/badge/Documentation-yes-brightgreen.svg" />
  </a>
  <a href="https://github.com/JamesMcNee/persevere-js/graphs/commit-activity" target="_blank">
    <img alt="Maintenance" src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" />
  </a> 
  <a href="https://github.com/JamesMcNee/persevere-js/blob/master/LICENCE.md" target="_blank">
    <img alt="Licence" src="https://img.shields.io/github/license/JamesMcNee/persevere-js" />
  </a>
  <a href="#" target="_blank">
    <img alt="Zero Runtime Dependencies" src="https://img.shields.io/badge/Runtime%20Dependencies-None-blue" />
  </a>
</p>

## Description
A small utility that provides an easy-to-read syntax for awaiting on a condition to be satisfied. This makes testing asynchronous logic a breeze! 

Heavily inspired by [Awaitility](http://www.awaitility.org/) which is a Java utility aimed at testing asynchronous systems.

### Example
This utility could be used in both production and test code, but primarily use cases tend towards the latter. 

For this example, imagine a simple backend for a local book store. The developer of the system wants to check the asynchronous 'real time' stocking system, which utilises a message queue. The flow for this is as follows:
1. Customer purchases a book
2. Purchase is placed onto a messaging queue for asynchronous processing
3. The message is consumed at some point later (usually milliseconds, sometimes seconds, but never more than 10 seconds) later by the bookstore backend
4. The books quantity is decremented by 1 in the database

The developer sets up the following simple test for this, thanks to `PersevereJS` 🚀

```typescript
describe('Stocking Tests', () => {
    
    it('should decrement stock quantity, when a book is purchased', () => {
        // Given
        const book = new Book('Harry Potter and the Philosophers Stone')
        
        // When
        bookService.addPurchaseToQueue(book)
        
        // Then
        persevereFor().atMost(10, 'SECONDS').until(() => bookRepository.getStockCountFor(book)).yieldsValue(0)
    })
})
```

In the above example, one of two things will happen:
1. The stock count will become 0 for the book within the allotted 10-second period.
2. The purchase message is never consumer, or takes longer than 10 seconds to be delivered and an exception will be thrown.

## Usage
By chaining temporal bindings and until conditions, you can craft powerful mechanisms to wait for asynchronous conditions to satisfy. 

The entrypoint into the wonderful world of waiting is the `persevereFor` function (note: `persevere` is also available and is functionally identical).

```typescript
// Wait for at most 30 seconds, for there to be an order from bob in the databsse
persevereFor()
    .atMost(30, 'SECONDS')
    .until(async () => {
        return db.query('SELECT ORDER_ID, CUSTOMER_ID FROM CUSTOMER_ORDERS');
    })
    .satisfies((customerOrders: { orderId: string, customerId: string}[]) => {
        return customerOrders
            .find(order => order.customerId = 'bob') != undefined;
    })
```

### Temporal Bindings
You can utilise the following temporal bindings for your persevere functions:

- `atMost` - Wait for at most the specified time for the condition to be met.
- `atLeast` - Expect that at least the specified time has passed before the condition is met. (Note: Must also provide an upper temporal bound).

### Until Conditions
You can utilise the following until conditions for determining success

- `yieldsValue` - Stop waiting once the underlying promissory function yields the value specified.
- `satisfies` - Stop waiting once the underlying promissory function satisfies the provided predicate.
- `noExceptions` - Stop waiting as soon as the underlying promissory function resolves (doesn't reject/throw).

## Licence
Copyright (c) 2023 James McNee Licensed under the MIT license.

---

_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
