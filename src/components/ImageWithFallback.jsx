import { FALLBACK_IMAGE } from '../data/mockData'

const ImageWithFallback = ({ src, alt, className, ...props }) => (
  <img
    src={src || FALLBACK_IMAGE}
    alt={alt}
    className={className}
    loading={props.loading || 'lazy'}
    onError={(event) => {
      event.currentTarget.src = FALLBACK_IMAGE
    }}
    {...props}
  />
)

export default ImageWithFallback


