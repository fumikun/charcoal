import * as React from 'react';
import { MenuListChildren } from '..';
import { DropdownMenuItemProps } from '../../DropdownMenuItem';
import MenuItem from '../../MenuItem';
import MenuItemGroup from '../../MenuItemGroup';

/**
 * valueというpropsを持つ子要素の値を再起的に探索して配列にする
 *
 * @param children
 * @param value
 * @param values
 * @returns
 */
export function getValuesRecursive(children: MenuListChildren) {
  const childArray = React.Children.toArray(children)
  const propsArray: DropdownMenuItemProps[] = []
  for (let i = 0; i < childArray.length; i++) {
    const child = childArray[i]
    if (React.isValidElement(child)) {
      const props = child.props as {
        value?: string
        disabled?: boolean
        isDefault?: boolean
        children?: React.ReactElement<typeof MenuItem | typeof MenuItemGroup>[]
      }
      if ('value' in props && typeof props.value === 'string') {
        propsArray.push({
          disabled: props.disabled,
          value: props.value,
          isDefault: props.isDefault,
        })
      }
      if ('children' in props && props.children) {
        propsArray.push(...getValuesRecursive(props.children))
      }
    }
  }
  return propsArray
}
