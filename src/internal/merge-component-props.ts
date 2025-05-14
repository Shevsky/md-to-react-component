import { AnyPropsDefinition, ConditionalPropsDefinition, PropsDefinition } from './../types';

export function mergeComponentProps(
  props?: PropsDefinition | null,
  secondProps?: AnyPropsDefinition | null
): Record<string, any> {
  if (secondProps) {
    if (isConditionalProps(secondProps)) {
      let mergedProps = { ...props, ...secondProps.default };

      for (const { when, then, otherwise } of secondProps.conditional) {
        const pass = Object.entries(when).every(([key, condition]) => {
          const value = props ? props[key] ?? null : null;

          if ('is' in condition) {
            if (condition.is === 'nullish') {
              return value === null;
            } else {
              return false;
            }
          } else if ('matches' in condition) {
            return (
              typeof value === 'string' &&
              (Array.isArray(condition.matches) ? condition.matches : [condition.matches!]).some((regex) =>
                new RegExp(regex).test(value)
              )
            );
          } else {
            return false;
          }
        });

        if (pass) {
          mergedProps = { ...mergedProps, ...then };
        } else {
          mergedProps = { ...mergedProps, ...otherwise };
        }
      }

      return mergedProps;
    } else {
      return { ...props, ...secondProps };
    }
  } else {
    return { ...props };
  }
}

function isConditionalProps(props: AnyPropsDefinition): props is ConditionalPropsDefinition {
  return !!props && 'default' in props && 'conditional' in props;
}
