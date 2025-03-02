export function deepMerge<T extends object>(...objects: Partial<T>[]): T {
  return objects.reduce((res, cur) => {
    if (cur) {
      ;(Object.keys(cur) as (keyof T)[]).forEach((key) => {
        const resVal = res[key]
        const curVal = cur[key]
        if (isObject(resVal) && isObject(curVal)) {
          // deep merge objects
          res[key] = deepMerge(resVal, curVal) as T[keyof T]
        } else {
          // replace arrays and primitives
          res[key] = curVal
        }
      })
    }
    return res
  }, {} as Partial<T>) as T
}

function isObject(value: any): value is object {
  return value && typeof value === 'object' && !Array.isArray(value)
}

export function parseHeaders(headers: string[]) {
  return headers.reduce(
    (obj, header) => {
      const [key, value] = header.replace(/: */, '\0').split('\0', 2)
      obj[key] = value
      return obj
    },
    {} as Record<string, string>,
  )
}
