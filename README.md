# What is this?
This is a tool I created to scrape the API of the public library of Amsterdam, and transform the data from XML to a useable JSON for all your javascript needs. Because the API is very slow and old it seems to fail a lot. I tried to create a workaround whenever the request for the results fails it will retry.

# How do I install this?
Request an API key from the [OBA](https://www.oba.nl/oba/english.html)

```
# Install the package:
npm install oba-scraper

# Create .env file for storing the public API key:
touch .env

# paste the APIkey in the .env file:
PUBLIC_KEY='{public_api_key}'
```

# How do I use this?

### Setting up the client
Simple! To create a call to the OBA-API create a new instance:
```javascript
const client = new oba_scraper({
	publicKey: process.env.PUBLIC_KEY
})
```

`publicKey` is **important**, otherwise you get authentication failures.
`process.env.PUBLIC_KEY` fetches the required public key from the `.env` file.

### Requesting a search
To create a search you need to make an object like this:
```javascript
const search = {
	endpoint: 'search',
	query: {
		q: 'boek',
		facet: 'Type(book)',
		refine: true
	},
	pages: {
		page: 1,
		pagesize: 20,
		maxpages: 25
    },
    filter: {
        pubYear: `book.publication && book.publication[0].year && book.publication[0].year[0]['_'] ? book.publication[0].year[0]['_'] : null`,
        language: `book.languages && book.languages[0] && book.languages[0].language && book.languages[0].language[0] ? book.languages[0].language[0]['_'] : null`,
        originLang: `book.languages && book.languages[0] && book.languages[0]['original-language'] ? book.languages[0]['original-language'][0]['_'] : null`
    }
}
```

#### endpoint:
```javascript
endpoint: 'search'
```
this is the endpoint, so the API knows what to do. For now there's no other functionality but 'search' so leave it as be.

#### query:
```javascript
query: {
		q: 'boek',
		facet: 'Type(book)',
		refine: true
	}
```
Chain your queries on what to look for here. You can add new keys without trouble.
*list of keys:*
```
! in progress !
```

#### pages:
```javascript
pages: {
		// Start from page:
		page: 1,
		// Results per page:
		pagesize: 20,
		// Maximum pages you want to resolve (maxpages * pagsize = #results)
		maxpages: 25
    }
```
As said in the comments, it tells the scraper what page to start from, what the results per page is (max. is 20, limitations of the API sadly, and how many pages you want to get. Say you start from page 25 and want to get a maximum of 30 pages, it will fetch pages 25 till 54 (that is 30 pages).

If the maxpages is higher than the amount of pages available for the search term it will instead only go for the amount of pages available.

#### filter:
```javascript
filter: {
        // Keys are custom: you can name them whatever, the values are ternary operators that failsafe if a value exists or not.
        pubYear: `book.publication && book.publication[0].year && book.publication[0].year[0]['_'] ? book.publication[0].year[0]['_'] : null`,
        language: `book.languages && book.languages[0] && book.languages[0].language && book.languages[0].language[0] ? book.languages[0].language[0]['_'] : null`,
        originLang: `book.languages && book.languages[0] && book.languages[0]['original-language'] ? book.languages[0]['original-language'][0]['_'] : null`
    }
```
This one is a bit trickier. The keys you define here are whatever you name them, this will output that name in your generated JSON. You can create your own ternary operators and fetch your desired data. 

But how do I know what to write for ternary operator? You can check that with the **Soon to come** [function](#showFormat)

# The API call functions
For now there's only one function call:

#### .getPages(searchObject)
```javascript
client.getPages(search).then(res => {
    // Do whatever with the results
})
```
The parameter you give is the object `search` you created to define your search. It's a promise so when the data is fetched it will give you back the result. 

**Start your index.js up, and see in the console how the scraper fetches the pages**

