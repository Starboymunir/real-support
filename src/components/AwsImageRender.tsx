'use client'

import { getUrl } from 'aws-amplify/storage'
import Image from 'next/image'
import { useEffect, useState } from 'react'

type PropsType = {
  imageKey?: string | null
  placeHolderImage?: string
  alt?: string
  width?: number
  height?: number
  fill?: boolean
  variant?: 'avatar' | 'contain' | 'cover'
  className?: string
  [key: string]: any
}

const AwsImageRender = ({
  imageKey = null,
  placeHolderImage,
  alt = 'image',
  width = 100,
  height = 100,
  // responsive fill mode
  fill = false,
  variant = 'contain',
  className = '',
  ...props
}: Partial<PropsType>) => {
  const [image, setImage] = useState<string | null>(null)
  const [loadImage, setLoadImage] = useState(false)

  useEffect(() => {
    const fetchImage = async (key: string) => {
      setLoadImage(true)
      try {
        const imageUrl = await getUrl({ key })
        setImage(imageUrl?.url?.href)
      } catch (err) {
        console.log(err)
      } finally {
        setLoadImage(false)
      }
    }

    if (imageKey) {
      fetchImage(imageKey)
    } else {
      setImage(null)
    }
  }, [imageKey])

  // Determine defaults based on variant
  let defaultClasses = 'align-middle shadow-md'
  let objectFit: 'contain' | 'cover' = 'contain'
  if (variant === 'avatar') {
    defaultClasses = `${defaultClasses} rounded-full`
    objectFit = 'cover'
  } else if (variant === 'cover') {
    objectFit = 'cover'
  } else {
    objectFit = 'contain'
  }
  // Combine default classes with user-provided classes
  const combinedClasses = `${defaultClasses} ${className}`.trim()

  const imgStyle = { objectFit }

  // If fill mode is requested, wrap the Image in a relative container with explicit height
  if (fill) {
    const containerStyle: React.CSSProperties = {
      position: 'relative',
      width: width || '100%',
      height: height || '100%',
    }

    return (
      <div className="flex justify-center items-center" style={containerStyle}>
        {!imageKey || loadImage || !image ? (
          <Image
            alt={alt}
            src={(placeHolderImage as string) || ''}
            fill
            style={imgStyle}
            className={combinedClasses}
            {...props}
          />
        ) : (
          <Image
            alt={alt}
            src={image}
            fill
            style={imgStyle}
            className={combinedClasses}
            {...props}
          />
        )}
      </div>
    )
  }

  // Default non-fill behavior: keep width & height for Next/Image optimization
  if (!imageKey || loadImage || !image) {
    return (
      <div className="flex justify-center items-center">
        <Image
          alt={alt}
          width={width}
          height={height}
          src={(placeHolderImage as string) || ''}
          className={combinedClasses}
          style={{ width, height, objectFit }} // ensure objectFit applied
          {...props}
        />
      </div>
    )
  }

  return (
    <div className="flex justify-center items-center">
      <Image
        alt={alt}
        width={width}
        height={height}
        src={image}
        className={combinedClasses}
        style={{ width, height, objectFit }} // ensure objectFit applied
        {...props}
      />
    </div>
  )
}

export default AwsImageRender
