export default async (milliseconds) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(true)
        }, milliseconds);
    })
}