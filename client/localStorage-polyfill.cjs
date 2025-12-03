// localStorage polyfill for Node.js (to fix VS Code terminal issue with --localstorage-file)
if (typeof globalThis.localStorage === 'undefined' || typeof globalThis.localStorage.getItem !== 'function') {
    const storage = {};
    globalThis.localStorage = {
        getItem: function (key) { return storage[key] !== undefined ? storage[key] : null; },
        setItem: function (key, value) { storage[key] = String(value); },
        removeItem: function (key) { delete storage[key]; },
        clear: function () { Object.keys(storage).forEach(function (key) { delete storage[key]; }); },
        key: function (index) { return Object.keys(storage)[index] || null; },
        get length() { return Object.keys(storage).length; },
    };
}
