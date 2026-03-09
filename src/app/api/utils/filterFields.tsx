


export const fieldsExtracter = (data: Record<string, File | null | undefined | string | null>, fieldsToExtract: string[]) => {
    const extractedFields:Partial<Record<string, File | string>>  = {};

    for (const field of fieldsToExtract) {
        const fieldData = data[field]
        if (fieldData) {
            extractedFields[field] = fieldData;
        }
    }

    return extractedFields
}


