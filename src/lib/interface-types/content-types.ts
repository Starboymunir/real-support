type ContentType='aboutUs'| 'termsAndCondition' |'privacyPolicy'
interface Content {
    title:string,
    description:string,
    createdAt:string,
    updatedAt:string,
    contentType:ContentType
}