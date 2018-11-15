const axios = require('axios')
const convert = require('xml-to-json-promise').xmlDataToJSON

module.exports = class oba_scraper {
	constructor(options) {
        this.key = options.publicKey,
        this.pages = {}
	}

	stringify(o) {
		const k = Object.keys(o)
		const v = Object.values(o)
		return k.map((ke, i) => `&${ke}=${v[i]}`).join('')
	}

	getHelpers(url, pagesize) {
		return axios
			.get(url)
			.then(res => convert(res.data))
			.then(res => {
				return {
					amount: Math.ceil(res.aquabrowser.meta[0].count[0] / pagesize) + 1,
					rctx: res.aquabrowser.meta[0].rctx[0]
				}
			})
			.catch(error => {
				console.log('getHelpers() failed! ' + error)
			})
	}

	getPage(url, helpers, filter) {
        return new Promise((resolve, reject) => {
            url = `${url}&page=${this.pages.page}&rctx=${helpers.rctx}`
            axios.get(url)
                .then(res => convert(res.data))
                .then(res => {
                    const filterKeys = Object.keys(filter)
                    const filterValues = Object.values(filter)
                    return res.aquabrowser.results[0].result.map(book => {
                        let createObject = {}
                        filterKeys.forEach((key, i) => {
                            createObject[key] = eval(filterValues[i])
                        })
                        return createObject
                    })
                })
                .then(res => resolve(res))
                .catch(err => reject(err))
        })
	}

	getPages(search = {}) {
        const url = `https://zoeken.oba.nl/api/v1/search/?authorization=${this.key}${this.stringify(search.query)}&pagesize=${search.pages.pagesize}`
        this.pages.page = search.pages.page
        
		return this.getHelpers(url, search.pages.pagesize).then(helpers => {
            helpers.amount > search.pages.maxpages ? (helpers.amount = search.pages.maxpages) : false

            return new Promise((resolve, reject) => {
                const promises = [];

                let getPagesSync = () => {
                    if (this.pages.page > helpers.amount) {
                        resolve({data: [].concat(...promises)})
                    } else {
                        console.log(`resolving page no.${this.pages.page}`)
                        this.getPage(url, helpers, search.filter)
                            .then(res => promises.push(res))
                            .then(this.pages.page++)
                            .then(getPagesSync)
                    }
                }

                getPagesSync()
            })
		})
	}
}
