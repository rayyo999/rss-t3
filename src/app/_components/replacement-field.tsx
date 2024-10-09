import { Cross2Icon, PlusIcon } from "@radix-ui/react-icons";
import { useFieldArray, useFormContext } from "react-hook-form";

import { Button } from "~/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";

interface ReplacementFieldProps {
  index: number;
}

export function ReplacementField({ index }: ReplacementFieldProps) {
  const { control } = useFormContext();

  const { fields, prepend, remove } = useFieldArray({
    control,
    name: `keys.${index}.replacements`,
  });

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() =>
          prepend({ id: crypto.randomUUID(), target: "", value: "" })
        }
      >
        <PlusIcon className="h-4 w-4" />
        Add Replace Target/Value
      </Button>
      {fields.map(({ id }, repIndex) => (
        <div key={id} className="grid grid-cols-[auto_1fr_1fr] gap-2">
          <Button
            type="button"
            variant="ghost"
            className="h-full"
            onClick={() => remove(repIndex)}
          >
            <Cross2Icon className="h-4 w-4" />
          </Button>
          <FormField
            control={control}
            name={`keys.${index}.replacements.${repIndex}.target`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="target" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`keys.${index}.replacements.${repIndex}.value`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="value" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      ))}
    </div>
  );
}
