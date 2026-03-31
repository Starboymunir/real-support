'use client'

import Image from 'next/image'
import { useMemo, useState } from 'react'
import { resolveS3Url } from '@/lib/api'

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
  const resolvedImage = useMemo(() => resolveS3Url(imageKey), [imageKey])

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
  const combinedClasses = `${defaultClasses} ${className}`.trim()
  const imgStyle = { objectFit }
  const displaySrc = resolvedImage || placeHolderImage || ''

  if (fill) {
    const containerStyle: React.CSSProperties = {
      position: 'relative',
      width: width || '100%',
      height: height || '100%',
    }

    return (
      <div className="flex justify-center items-center" style={containerStyle}>
        <Image
          alt={alt}
          src={displaySrc}
          fill
          style={imgStyle}
          className={combinedClasses}
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
        src={displaySrc}
        className={combinedClasses}
        style={{ width, height, objectFit }}
        {...props}
      />
    </div>
  )
}

export default AwsImageRender
