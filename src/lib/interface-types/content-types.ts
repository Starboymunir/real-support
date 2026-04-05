type ContentType='aboutUs'| 'termsAndCondition' |'privacyPolicy' | 'services'
interface Content {
    title:string,
    description:string,
    createdAt:string,
    updatedAt:string,
    contentType:ContentType
}