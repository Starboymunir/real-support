


export const fieldsExtracter = (data, fieldsToExtract) => {
    const extractedFields = {};

    for (const field of fieldsToExtract) {
        const fieldData = data[field]
        if (fieldData) {
            extractedFields[field] = fieldData;
        }
    }

    return extractedFields
}


