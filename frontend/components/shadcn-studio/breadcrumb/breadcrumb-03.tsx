import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { HouseIcon, CaretDoubleRightIcon, GlobeHemisphereWestIcon, FileTextIcon } from '@/components/ui/phosphor-icons'

const BreadcrumbChevronsSeparatorDemo = () => {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href='#'>
            <HouseIcon className='size-4' />
            <span className='sr-only'>Home</span>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <CaretDoubleRightIcon />
        </BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbLink href='#' className='flex items-center gap-1'>
            <GlobeHemisphereWestIcon className='size-4' />
            Documents
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <CaretDoubleRightIcon />
        </BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbPage className='flex items-center gap-1'>
            <FileTextIcon className='inline size-4' />
            Add Document
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export default BreadcrumbChevronsSeparatorDemo
