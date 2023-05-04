const circularReplacer = () => {
  const seen = new WeakSet();
  return (_, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) return;
      seen.add(value);
    }
    return value;
  };
};

const LOGGER  = {
  info: (reqId, componentName, message, data) => {
    console.log(JSON.stringify({
      logLevel: 'info',
      reqId,
      componentName,
      message,
      data,
    }, circularReplacer()));
  },
  error: (reqId, componentName, message, data) => {
    console.log(JSON.stringify({
      logLevel: 'error',
      reqId,
      componentName,
      message,
      data,
    }, circularReplacer()));
  },
  warn: (reqId, componentName, message, data) => {
    console.log(JSON.stringify({
      logLevel: 'warn',
      reqId,
      componentName,
      message,
      data,
    }, circularReplacer()));
  },
  debug: (reqId, componentName, message, data) => {
    console.log(JSON.stringify({
      logLevel: 'debug',
      reqId,
      componentName,
      message,
      data,
    }, circularReplacer()));
  }
};

export default LOGGER;
