export const convertFormData = (body: FormData):any=> {
    let data: Partial<Record<string, string | File>> = {}; // Initialize data as an empty object
    body.forEach((value: FormDataEntryValue, key: string) => {
        data[key] = value// Convert FormDataEntryValue to string
    });


    console.log("Convert Form Data",data);
    return data;
}