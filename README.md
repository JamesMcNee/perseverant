<h1 align="center">Welcome to PersevereJS 👋</h1>
<p>
  <a href="#" target="_blank">
    <img alt="Build" src="https://github.com/JamesMcNee/perseverejs/actions/workflows/main.yml/badge.svg" />
  </a>
  <a href="https://www.npmjs.com/package/perseverejs" target="_blank">
    <img alt="Version" src="https://badge.fury.io/js/perseverejs.svg" />
  </a>
  <a href="https://github.com/JamesMcNee/perseverejs#readme" target="_blank">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg" />
  </a>
  <a href="https://github.com/JamesMcNee/perseverejs/graphs/commit-activity" target="_blank">
    <img alt="Maintenance" src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" />
  </a>
</p>

## Description
A small utility that provides an easy-to-read syntax for awaiting on a condition to be satisfied.

Heavily inspired by [Awaitility](http://www.awaitility.org/) which is a Java utility aimed at testing asynchronous systems.

## Example
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
        persevere().atMost(10, 'SECONDS').until(() => bookRepository.getStockCountFor(book)).yieldsValue(0)
    })
})
```

In the above example, one of two things will happen:
1. The stock count will become 0 for the book within the allotted 10-second period.
2. The purchase message is never consumer, or takes longer than 10 seconds to be delivered and an exception will be thrown.

_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
