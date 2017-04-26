# nightmare-examples

This project contains supplementary examples and documentation for [Nightmare JS](http://www.nightmarejs.org).

## Documentation

### Getting Started

New to Nightmare? The most basic way to use it is with promises or callbacks. Here are a few examples:

- [Native promises](https://github.com/rosshinkley/nightmare-examples/blob/master/docs/beginner/promises.md)
- [Callbacks](https://github.com/rosshinkley/nightmare-examples/blob/master/docs/beginner/callbacks.md)

#### Nightmare and Generators

Several JavaScript libraries use generators to give you a simpler way to deal with asynchronous events. Here’s how to use Nightmare with some of them:

- [`vo`](https://github.com/rosshinkley/nightmare-examples/blob/master/docs/beginner/vo.md)
- [`co`](https://github.com/rosshinkley/nightmare-examples/blob/master/docs/beginner/co.md)
- [`mocha-generators`](https://github.com/rosshinkley/nightmare-examples/blob/master/docs/beginner/mocha-generators.md)

#### Extending Nightmare

Nightmare may not do everything out of the box that you need it to do.

- [`.action()`](https://github.com/rosshinkley/nightmare-examples/blob/master/docs/beginner/action.md) - Look here if adding a method that does a specific activity in the browser.
- [`.use()`](https://github.com/rosshinkley/nightmare-examples/blob/master/docs/beginner/use.md) - Wrap several actions up for reusability in one tidy place.

### Common Pitfalls
Working with an automated web browser can be complex. Here are a few common gotchas and issues you might run into while working with Nightmare:

- [Asynchronous operations and loops](https://github.com/rosshinkley/nightmare-examples/blob/master/docs/common-pitfalls/async-operations-loops.md)
- [Variable lifting with `.evaluate()`](https://github.com/rosshinkley/nightmare-examples/blob/master/docs/common-pitfalls/variable-lifting.md)

### Known Issues

Here are some known problems with Nightmare:

- [Uploads](https://github.com/rosshinkley/nightmare-examples/blob/master/docs/known-issues/uploads.md)
- [`then...catch`](https://github.com/rosshinkley/nightmare-examples/blob/master/docs/known-issues/then-catch.md)
- [Globally defined variables in injected scripts](https://github.com/rosshinkley/nightmare-examples/blob/master/docs/known-issues/globally-defined-variables.md)

## Examples

All pages above have accompanying scripts you can actually run. To get started, you’ll need to make sure you install their dependencies first by running `npm install`.

After that, all the examples are runnable using `node [example]`.

## Additions and Corrections

If something has been missed, needs correcting, or you have a question, feel free to open an issue or pull request.
