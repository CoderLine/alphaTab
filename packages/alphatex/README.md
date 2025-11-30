# alphaTex Language Definitions

This folder contains the overall language definitions for alphaTex. These definitions define what metadata tags exist,
what parameters they support, the that exist etc. 

These definitions are used to generate 

1. parser related code embedded in the main alphaTab library.
2. definitions needed by the language server to provide coding assistence. 
3. The documentation website for alphaTex describing all available elements.

We do not maintain a formal documentation of how to write definitions and how the tooling works. It's recommended
that you look at the existing definitions and try to derive from the code how things are working. Feel free to ask on GitHub if you want more details.

On high level: 

1. The main language definitions on what tags and properties exist including their parameters, types documentation etc are defined within this package. 
2. Run `npm run generate` to translate these definitions to more lightweight definitions for the parser. It will generate bits like the parameter definitions and enum mappings to use there. 
3. The `AlphaTex1LanguageHandler` needs to be implemented matching the definitions. The logic of mapping the AST into the data model is not part of the central language definition. Same applies for generating the AST. Maybe this is added in future by copying also a mapping logic from here into the generated code.


