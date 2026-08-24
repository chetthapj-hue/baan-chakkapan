const FormInput = ({
  label,
  error,
  as = 'input',
  children,
  className = '',
  ...props
}) => {
  const Component = as
  const id = props.id || props.name

  return (
    <label className={`grid gap-2 text-sm font-semibold text-[#0E4F52] ${className}`}>
      <span>
        {label}
        {props.required && <span className="text-red-600"> *</span>}
      </span>
      {children || <Component id={id} className="form-field" {...props} />}
      {error && <span className="text-xs font-semibold text-red-600">{error}</span>}
    </label>
  )
}

export default FormInput


