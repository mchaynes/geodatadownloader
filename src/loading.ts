

export type setLoadingFunc = (loading: boolean) => void

export async function setLoadingWhile<T>(f: () => Promise<T>, setLoading: setLoadingFunc): Promise<T> {
    let result: T
    try {
        setLoading(true)
        result = await f()
    } finally {
        setLoading(false)
    }
    return result
}