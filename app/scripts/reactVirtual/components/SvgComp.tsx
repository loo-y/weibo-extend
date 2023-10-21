interface ISvgCompProps {
    svgString: string
    asImg?: boolean
    className?: string
}

const SvgComp = ({ svgString, asImg, className }: ISvgCompProps) => {
    if (asImg) {
        return (
            <img
                src={`data:image/svg+xml;utf8,${encodeURIComponent(
                    "<?xml version='1.0' encoding='UTF-8'?>" + svgString
                )}`}
                className={className || ''}
            />
        )
    }

    return <svg dangerouslySetInnerHTML={{ __html: svgString }} className={`${className || ''}`} />
}

export default SvgComp
