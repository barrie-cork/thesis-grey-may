import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function ShadcnExample() {
  const [inputValue, setInputValue] = useState("");

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Shadcn UI Example</CardTitle>
          <CardDescription>This is an example of Shadcn UI components in Thesis Grey</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Input 
              placeholder="Enter some text" 
              value={inputValue} 
              onChange={(e) => setInputValue(e.target.value)} 
            />
          </div>
          {inputValue && (
            <p className="text-sm text-gray-500">
              You typed: {inputValue}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setInputValue("")}>
            Clear
          </Button>
          <Button>Submit</Button>
        </CardFooter>
      </Card>
    </div>
  );
} 