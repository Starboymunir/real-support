

export const addressFieldChecker = (data) => {
    const { city, latitude,
        longitude } = data || {}

    if (city, latitude, longitude) {
        return true
    }
    return false
}