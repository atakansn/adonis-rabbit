import stringify from 'fast-safe-stringify'

function replacer(_: any, value: string) {
  if (value === '[Circular]') {
    return
  }

  return value
}

export function safeStringify(value: any) {
  return stringify.default(value, replacer)
}
