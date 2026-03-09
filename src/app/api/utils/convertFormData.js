
export const convertFormData = (body) => {
    let data = {}
    body.forEach((value, key) => {
        data[key] = value
    });

    return data
}