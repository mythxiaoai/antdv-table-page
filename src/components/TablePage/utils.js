const methods = ['get', 'delete', 'post', 'put', 'patch'];
export let api = new Proxy(Object.create(null), {
    get(target, key) {
        if (methods.includes(key)) {
            return async (url, params = {}, options = {}) => {
                var options = {
                    method: key,

                    headers: {
                        "content-type": "application/json",
                    },
                };
                if (key !== "get") {
                    options.body = JSON.stringify(params)
                } else {
                    url += objToUrlParams(params)
                }
                return await (await fetch(url, options)).json();
            }
        }
    }
});


// 格式化参数并添加到url上 (http://www.xxx.com?a=1&b=2)
function objToUrlParams(params) {
    if (params && Object.keys(params).length) {
        let queryString = ''
        Object.keys(params).forEach((key) => {
            queryString += `${key}=${encodeURIComponent(params[key])}&`
        })

        return `?${queryString.replace(/&$/, '')}`
    }

    return ''
}


