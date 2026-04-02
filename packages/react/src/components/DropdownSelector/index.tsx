import './index.css';

import { useId } from '@react-aria/utils';
import { useVisuallyHidden } from '@react-aria/visually-hidden';
import React, { ReactNode, useCallback, useMemo, useRef, useState } from 'react';
import { useClassNames } from '../../_lib/useClassNames';
import FieldLabel from '../FieldLabel';
import Icon from '../Icon';
import { AssistiveText } from '../TextField/AssistiveText';
import { DropdownPopover } from './DropdownPopover';
import MenuList, { MenuListChildren } from './MenuList';
import { getValuesRecursive } from './MenuList/internals/getValuesRecursive';
import { PopoverProps } from './Popover';
import { findPreviewRecursive } from './utils/findPreviewRecursive';

export type DropdownSelectorProps = {
  label: string
  value?: string
  disabled?: boolean
  placeholder?: string
  showLabel?: boolean
  invalid?: boolean
  assistiveText?: string
  required?: boolean
  requiredText?: string
  subLabel?: ReactNode
  /**
   * the name of hidden `<select />`
   */
  name?: string
  children: MenuListChildren
  onChange: (value: string) => void
  className?: string
  selectRef?: React.Ref<HTMLSelectElement>
} & Pick<PopoverProps, 'inertWorkaround'>

export default function DropdownSelector({
  onChange,
  showLabel = false,
  selectRef,
  ...props
}: DropdownSelectorProps) {
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const propsArray = getValuesRecursive(props.children)
  const defaultItemValue = useMemo(
    () => propsArray.find((itemProps) => itemProps.isDefault === true)?.value,
    [propsArray],
  )

  const selectedValue = useMemo(() => {
    if (props.value !== undefined) {
      return props.value
    }
    return defaultItemValue ?? ''
  }, [props.value, defaultItemValue])

  const preview = findPreviewRecursive(props.children, selectedValue)
  const isDefaultSelected =
    defaultItemValue !== undefined && selectedValue === defaultItemValue

  const isPlaceholder = useMemo(
    () => isDefaultSelected || (props.placeholder !== undefined && preview === undefined),
    [isDefaultSelected, preview, props.placeholder],
  )

  const { visuallyHiddenProps } = useVisuallyHidden()

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange(e.target.value)
    },
    [onChange],
  )

  const labelId = useId()
  const describedbyId = useId()

  const classNames = useClassNames(
    'charcoal-dropdown-selector-root',
    props.className,
  )

  return (
    <div className={classNames} aria-disabled={props.disabled}>
      <FieldLabel
        id={labelId}
        label={props.label}
        required={props.required}
        requiredText={props.requiredText}
        subLabel={props.subLabel}
        {...(!showLabel ? visuallyHiddenProps : {})}
      />
      <div {...visuallyHiddenProps} aria-hidden="true">
        <select
          name={props.name}
          value={selectedValue}
          onChange={handleChange}
          tabIndex={-1}
          ref={selectRef}
        >
          {propsArray.map((itemProps) => {
            return (
              <option
                key={itemProps.value}
                value={itemProps.value}
                disabled={itemProps.disabled}
              >
                {itemProps.value}
              </option>
            )
          })}
        </select>
      </div>
      {/* eslint-disable-next-line jsx-a11y/role-supports-aria-props */}
      <button
        className="charcoal-dropdown-selector-button"
        aria-labelledby={labelId}
        aria-invalid={props.invalid}
        aria-describedby={
          props.assistiveText !== undefined ? describedbyId : undefined
        }
        disabled={props.disabled}
        onClick={() => {
          if (props.disabled === true) return
          setIsOpen(true)
        }}
        ref={triggerRef}
        type="button"
        data-active={isOpen}
      >
        <span
          className="charcoal-ui-dropdown-selector-text"
          data-placeholder={isPlaceholder}
        >
          {preview === undefined ? props.placeholder : preview}
        </span>
        <Icon className="charcoal-ui-dropdown-selector-icon" name="16/Menu" />
      </button>
      {isOpen && (
        <DropdownPopover
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          triggerRef={triggerRef}
          value={selectedValue}
          inertWorkaround={props.inertWorkaround}
        >
          <MenuList
            value={selectedValue}
            onChange={(v) => {
              onChange(v)
              setIsOpen(false)
            }}
          >
            {props.children}
          </MenuList>
        </DropdownPopover>
      )}
      {props.assistiveText !== undefined && (
        <AssistiveText data-invalid={props.invalid === true} id={describedbyId}>
          {props.assistiveText}
        </AssistiveText>
      )}
    </div>
  )
}
