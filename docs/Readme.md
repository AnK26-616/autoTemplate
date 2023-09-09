# autoTemplate readme

## About

The _autoTemplate_ is an _extention script_ for the [Templater](https://github.com/SilentVoid13/Templater) plugin for [Obsidian](https://github.com/obsidianmd/obsidian-releases). 

The script has been written to address some inconveniences around using Obsidian's frontmatter either handled natively or via _Templater_. The idea of using prefixes to trigger template application has been borrowed from Pamela Wang's [Meta Templater](https://www.youtube.com/watch?v=5zcdG6ZWja4) .

The script facilitates two main tasks:
- standardizing the note file name convention to follow _Zettelkasten_ rules
- automation in handling note properties (like ID), especially connected with the moment of creation of the note 

The script works only for the frontmatters written in YAML. It does not changes / affects the frontmatter / properties defined in any other way. And it does not work for notes without frontmatter defined at all (although it works for empty ones).

Script is easily configurable with the predefined _config_ object.

- [Installation](Installation.md)
- [Installation]("Using script.md")
## Version history

	1.0 - initial version

## Licensing

This piece of software is released under [MPL 2.0](https://www.mozilla.org/en-US/MPL/2.0/).
