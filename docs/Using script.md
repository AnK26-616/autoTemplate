# autoTemplate: using script

## Using script

#### Use cases

There are three general use cases for the script:

- renaming / standardizing the frontmatter of an existing note
- applying a template to existing note
- creation of a new note based on _auto applied_ or _triggered_ template

Let's discuss them one by one below.

All the examples given assume _Templater_ plugin is installed and configured as well the _autoTemplate_ script is installed per the guidelines provided in the [[Readme#Installation|installation]] section.

#### Using _autoTemplate_ to rename existing note

Lets assume you have already your note written and structured. All you need is to rename it and rebuild the frontmatter accordingly.

In order to do so it is enough to place this piece of script:

```js
	<%*
		let myTemplate = new tp.user.autoTemplate(tp);
		tR = await myTemplate.apply();
	-%>
```

between frontmatter and the body of your note (including title, if exists), like in the example below:

```code
---
category: memo
---
	<%*
		let myTemplate = new tp.user.autoTemplate(tp);
		tR = await myTemplate.apply();
	-%>
# My title
```

After applying the template to the note (_Templater_ plugin default is _Alt+R_) you should have your file renamed and the properties added to the frontmatter.

**Limitation**: the script works only for the notes with YAML formatted frontmatter. It can be empty like the one below:

```
---
---
```

but it has to exist in order to make the _autoTemplate_ work. 

#### Using _autoTemplate_ when applying a new template to existing note

Using the same approach as above, insert this piece of script:

```js
	<%*
		let myTemplate = new tp.user.autoTemplate(tp);
		tR = await myTemplate.apply();
	-%>
```

between frontmatter and the body of your note template. Of course the note template may include much more scripts and customization. All of them will be processed accordingly assuming they are placed _after_ the lines above.

Due to the way _Templater_ plugin handles target note content (with _tR_ variable), to avoid any unexpected behaviour it is best not to combine the _autoTemplate_ script with any other script / scriptlet within the same script block. If you need - you can open another script block and the note file should be processed properly.

#### Using _autoTemplate_ when creating a note using triggered template

In this mode of operation you need to create a dedicated template to define / handle the triggers. This template may be defined like this:

```js
	<%*
		let myTemplate = new tp.user.autoTemplate(tp);
		myTemplate.addTrigger("refb","Book","template-Book")
		myTemplate.addTrigger("ntb","","note-Basic")
		tR = await myTemplate.apply();
	-%>
```

Save that note to lets say _default.md_ and using _Templater_ plugin, assign that as a folder template to the folder of your choice (or to the main vault folder '/' as it was shown in [[Readme#Installation|installation]] section in step 5).

How it works? The first and the last line should be obvious after reading the sections above. With the _addTrigger_ command you can define the 'triggers' to handle automatic template application.

```js
myTemplate.addTrigger("refb","Book","template-Book")
```

This command defines 'refb' trigger which references 'template-Book' template. The second parameter - which is 'Book' in this case - is used when renaming the files providing 

Lets consider you place:

```
[[refb=My new book]]
```

in your note. So the link is created using keyword 'refb' followed by _trigger_ sign '=' and then the target note name. Assuming the "My new book" note does not exist in your repository, if you click on that link, _Obsidian_ - by design - creates the new note with that name. As you have defined a 'trigger', this creation process will be intercepted and the associated 'template-Book' template will be applied to that note automatically. Additionally the note will be renamed using 'Book' as a note filename type extension. 

Assuming all the configuration options matches defaults - you should see the new note with 'template-Book' template applied and renamed to **Book - My new book @ 202309010903** or something similar.

If you omit the second parameter:

```js
myTemplate.addTrigger("ntb","","note-Basic")
```

the script still will work however the type extension for the filename will not be defined. Using example above - you can use the link:

```
[[ntb=New note]]
```

to create a new note file, which will take 'note-Basic' as a template and will be renamed to **New note @ 202309010904** or similar name. Note that there is no type extension part of the filename preceding the original note name.

More on how to configure that feature can be found in the proper section of [[Readme#addTrigger|configuration]] section.

#### Features

##### Properties
_autoTemplate_ adds / alters couple of properties within note frontmatter. Below is the full list of affected properties:

Unique note identifier:

```
unid: 202309010822
```

is usually based on the current date-time. The format of that can be configured with the help of _config_ object (see the section [[Readme#unid|configuration]] for more details).

The creation date is stored in the following property:

```
created: 2023-09-01
```

as well it is added into tags list property:

```
tags: 
	- 2023-09-01
```

The title of the note (not to be confused with the note file name) is stored in the following property:

```
title: My note title
```

The same note file is the put into the list property:

```
aliases: 
	- My note title
```

And finally if the note has been formatted using template trigger, the template name used is stored in this property:
```
template: note-Template
```

***Note:*** the _tags_ and _aliases_ properties are treated as collection properties. The _autoTemplate_ script will follow the format of the collection that already exists in the frontmatter i.e. if will continue adding the items into the array (if the property is of array type, '[ ]' or into the list (if the property is of list type '-'). If given property is empty or it does not exist at all - the list format is assumed (i.e. all the items will be preceded with '-')
##### Note filename standardization

The standard note naming convention follow the rule presented below:

- first part of the filename makes a template note title used to format the note (if present)
- second part of the filename makes an (original) note title 
- third part of the note makes a UNID

All parts are separated with predefined separators (and possibly spaces), e.g. **Basic Note - My first note @ 202301010900**

More on the configuration of the note filename naming convention can be found [[Readme#titleScheme|here]].

There are three possible sources of the title:

- **filename** - this source is being used in case the 'unid' property is not present and the filename is different then 'untitled'
- **note title** - defined as the top most heading (using the markup syntax with # sign)
- **manually entered by user** - the prompt to provide the title is displayed if the filename is 'untitled' and the note title does not exist and the 'unid' property is not present


#### Configuration

Lets assume we have defined a following template object:

```js
	<%* let myTemplate = new autoTemplate(tp); %>
```

You can alter the default behaviour of the script by directly accessing the '.config' property and its sub-properties. The values presented below are the _default_ ones that will be used if you do not alter / redefine given property. Of course you can always change it per your taste!

##### prompt

```js
	<%* myTemplate.config.prompt = "Title"; %>
```

Format of the system prompt used to rename the 'Untitled' note.

##### renameNote

```js
	<%* myTemplate.config.renameNote = true; %>
```

Indicates if the note needs to be renamed (when the value is set to 'true') or the original one should be kept (if 'false').

##### trailingSpaces

```js
	<%* myTemplate.config.trailingSpaces = true; %>
```

Surrounds the separators with extra spaces (when the value is set to 'true') or not (if 'false'). It allows to format the note title in more readable form.

##### titleScheme

```js
	<%* myTemplate.config.titleScheme = "xti"; %>
```

Defines the main rule to follow when renaming the note file. This string represents an order of title parts where:

- **x** - stands for note type, template or 'extension' title part  (more on that matter in the section describing templates definitions below)
- **t** - stands for the regular note title part
- **i** - stands for the note ID part

**Example**: Taking all together, following the default title scheme, default separators, and assuming the template trigger is defined, the note titled "My first note" could be renamed into: **Basic Note - My first note @ 202301010900**

##### unid

```js
	<%* 
		myTemplate.config.unid.type = "datetime"; 
		myTemplate.config.unid.format = "YYYYMMDDHHmm"; 
		myTemplate.config.unid.separator = "@"; 
	%>
```

Defines universal note ID (unid) for given note following _Zettelkasten_ idea. Currently only the IDs of "datetime" type are supported. They are not truly randomized by created based on the actual date and time stamp. 

With the 'format' property you can however alter the format of the ID itself. 

The 'separator' property gives you an ability to define the separator which will be used to connect the ID part of the note file name ('i' token of the 'titleScheme' property - see  [[Readme#titleScheme|above]]) with the rest of the title.

##### frontmatter

```js
	<%* 
		myTemplate.config.frontmatter.unid = true;
		myTemplate.config.frontmatter.alias = true;
		myTemplate.config.frontmatter.created = true;
		myTemplate.config.frontmatter.title = true;
		myTemplate.config.frontmatter.datetag = true;
		myTemplate.config.frontmatter.template = true;
	%>
```

Each of the properties defined above allow to decide if given part of frontmatter should be updated or created in case it does not exist (if the value is 'true') or not (if 'false'). The meaning of the particular parts is the following:

- unid - universal note ID
- alias - 'aliases' property will be replaced or extended with the title of the note (not a name of a file containing the note)
- created - date of note creation, following the format YYYY-MM-DD
- title - the title of the note
- datetag - 'tags' property will be replaced or extended with the created date
- template - template name used to format the note

Note: 'alias' and 'datetag' properties work differently based on what they find in the exsiting frontmatter. If the properties 'aliases', 'tags' are defined as collections or arrays - it will follow that rule by adding one more entry to them. Otherwise the properties will be overwritten with the new values of alias or date tag.

##### template

```js
	<%* 
		myTemplate.config.template.trigger = "="; 
		myTemplate.config.template.separator = "-"; 
	%>
```

Allows you to specify actually two types of template related separators. The 'trigger' one is used when creating the note directly from another note. More on using triggered templates in the 'Using' section.

The 'separator' one is used to separate the note type / template / extension note title part ('x' token of the 'titleScheme' property - see [[Readme#titleScheme|above]]) 

##### addTrigger

```js
	<%* 
		myTemplate.config.addTrigger(prefix, description, file); 
	%>
```

Add new trigger template. Each trigger template consist of following:

- prefix - this is what allows to distinguish between your template files and used when automatically applying the template from another note file
- description - description of the template or note type - which may be used to form a note file name
- file - file containing the note template (either the regular template or more sophisticated using _Templater_)

Example: 

```js
	<%* 
		myTemplate.config.addTrigger("ntb", "Basic Note", "note-Basic"); 
	%>
```

In the example above, when using ```[[ntb=My new note]]``` to trigger new note creation, the new note will be created, renamed to **Basic Note - My new note @ 202301010910** and the 'note-Basic' template will be applied automatically to it.

