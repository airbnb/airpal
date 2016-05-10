const logError = (e) => console && e && e.stack && console.error(e.stack)

export default logError
