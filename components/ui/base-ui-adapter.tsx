"use client";

import { useRender } from "@base-ui/react/use-render";
import { Children, createElement, isValidElement } from "react";
import type {
  ComponentProps,
  CSSProperties,
  ElementType,
  HTMLAttributes,
  ReactElement,
  ReactNode,
  Ref,
} from "react";

type ElementProps<P> = Omit<P, "className" | "style" | "render"> & {
  className?: string;
  style?: CSSProperties;
  render?: ReactElement;
  asChild?: boolean;
};

// Internal compatibility boundary: existing website composition and state selectors
// are preserved while interaction, focus, and accessibility come from Base UI.
const StateElement = ({
  elementProps,
  state,
  render,
  tag,
}: {
  elementProps: Record<string, unknown>;
  state: Record<string, unknown>;
  render?: ReactElement;
  tag: keyof React.JSX.IntrinsicElements;
}) => {
  let dataState: string | undefined;
  if ("open" in state) {
    dataState = state.open ? "open" : "closed";
  } else if ("checked" in state) {
    dataState = state.checked ? "checked" : "unchecked";
  } else if ("active" in state) {
    dataState = state.active ? "active" : "inactive";
  } else if ("pressed" in state) {
    dataState = state.pressed ? "on" : "off";
  }
  return useRender({
    defaultTagName: tag,
    props: {
      ...elementProps,
      "data-state": dataState,
      ...("swipeDirection" in state
        ? { "data-swipe-direction": state.swipeDirection }
        : {}),
    },
    render,
  });
};

export const adaptBase = <T extends ElementType>(
  Primitive: T,
  tag: keyof React.JSX.IntrinsicElements = "div",
  supportsNativeButton = tag === "button"
) => {
  const Adapted = ({
    asChild,
    render,
    children,
    ...props
  }: ElementProps<ComponentProps<T>>) => {
    const childNodes = asChild ? Children.toArray(children as ReactNode) : [];
    const child = asChild
      ? Children.only(childNodes.length === 1 ? childNodes[0] : children)
      : render;
    const element = isValidElement(child) ? child : undefined;
    const nativeButton =
      element && typeof element.type === "string"
        ? element.type === "button"
        : true;
    return createElement(Primitive, {
      ...props,
      ...(supportsNativeButton ? { nativeButton } : {}),
      children: asChild ? undefined : children,
      render: (
        elementProps: Record<string, unknown>,
        state: Record<string, unknown>
      ) => (
        <StateElement
          elementProps={elementProps}
          state={state}
          render={element}
          tag={tag}
        />
      ),
    } as ComponentProps<T>);
  };
  return Adapted;
};

export const adaptPopup = <T extends ElementType, P extends ElementType>(
  Popup: T,
  Positioner: P,
  defaults: Partial<ComponentProps<P>> = {}
) => {
  const Content = adaptBase(Popup);
  return ({
    side,
    align,
    sideOffset,
    alignOffset,
    collisionPadding,
    ...props
  }: ComponentProps<typeof Content> & {
    side?: "top" | "right" | "bottom" | "left";
    align?: "start" | "center" | "end";
    sideOffset?: number;
    alignOffset?: number;
    collisionPadding?: number;
  }) =>
    createElement(Positioner, {
      ...defaults,
      align,
      alignOffset,
      children: createElement(Content, props as ComponentProps<typeof Content>),
      className: "z-50 outline-none",
      collisionPadding,
      side,
      sideOffset,
    } as ComponentProps<P>);
};

export const Slot = {
  Root: ({
    children,
    ref,
    ...props
  }: HTMLAttributes<HTMLElement> & { ref?: Ref<HTMLElement> }) =>
    useRender({
      props,
      ref,
      render: children as ReactElement,
    }),
};
