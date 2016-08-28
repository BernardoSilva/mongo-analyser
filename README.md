# Mongo Analyser

A command line tool to make developer life easier to extract an analytic report of the data he contains in his MongoDB database collections.


## How to use

```sh
node index.js --db you-db-name
```

By default this will connect to your mongoDB database, get a list of all your MongoDB collections and try to generate an analytic report for each collection.



## TODO

- [ ] Allow to pass parameters to variety tool that is used to extract analytic data for each collection
- [ ] Allow to pass a specific collection to generate the Analytic Data dump for
- [ ] Allow to pass an array of collections to generate the Analytics Data dump for


## License

[The MIT License (MIT)](./LICENSE.md)


Credits:

This tool is based on Variety



