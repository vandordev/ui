"use client";

import "blobatar/motion.css";
import { happy, idle, thinking, wink } from "blobatar/expression";
import { useState } from "react";

import { Blobatar } from "@/registry/new-york/blobatar";
import { Button } from "@/registry/new-york/button";

const expressions = { happy, idle, thinking, wink };

export const BlobatarMotionDemo = () => {
  const [expression, setExpression] =
    useState<keyof typeof expressions>("idle");
  return (
    <div className="flex flex-col items-center gap-5">
      <Blobatar
        name="vandor"
        size={96}
        blobatar={{ animate: "always", expression: expressions[expression] }}
      />
      <div
        className="flex flex-wrap justify-center gap-2"
        aria-label="Avatar expression"
      >
        {(Object.keys(expressions) as (keyof typeof expressions)[]).map(
          (pose) => (
            <Button
              key={pose}
              variant="outline"
              size="sm"
              aria-pressed={expression === pose}
              onClick={() => setExpression(pose)}
            >
              {pose}
            </Button>
          )
        )}
      </div>
      <p className="text-sm text-muted-foreground">
        The selected pose stays until you choose another.
      </p>
    </div>
  );
};
