/*
	autoTemplate script
 	2023 (C) AnK26-616
  	version 1.0
*/

//------------------------------------------------------
// Functions
//------------------------------------------------------

function injectMetadata(collection, strVal){
    if (collection.toLowerCase().includes(strVal.toLowerCase()))
    {
        return collection;
    }else{
        if (collection.includes("[")){
            if (collection.match(/\[\s*\]/g)!=null){
                return collection.replace(/\]/g, strVal + "]");
            }else{
                return collection.replace(/\]/g, ", " + strVal + "]");
            }
        }else{
            return collection + "  - " + strVal + "\n";
        }
    }
}

function changeMetadata(strInput, strKey, strVal, strMode){
    let fmMetadata = "";
    let fmClose = "";
    if (strInput.toLowerCase().includes(strKey + ":")) {
        fmMetadata = new RegExp(strKey + ":\\s*?(-\\s*[\\s\\S]*?)(?=\\w+:|---)|(" + strKey + ":\\s*?(.*)\\n)", "i");
        fmClose = "\n";
    } else {
        fmMetadata = new RegExp("---$", "i");
        fmClose = "\n---";
    };

    let fmToken = strInput.match(fmMetadata)[0];
    multi = (fmToken.match(/\[|(\n\s*?-[^-])/g) != null);

    if (multi){
        //For compatibility only
        return strInput.replace(fmMetadata, injectMetadata(fmToken, strVal)); 
    }else{
        if(strKey=="aliases" || strKey=="tags")
        {
            return strInput.replace(fmMetadata, strKey + ": \n  - " + strVal + fmClose);
        }else{
            return strInput.replace(fmMetadata, strKey + ": " + strVal + fmClose);
        }
    }
}

//------------------------------------------------------
// autoTemplate Class
//------------------------------------------------------

module.exports = class autoTemplateClass {

    // Private fields
    #triggers = [];
    #templater = {};

    //Public fields
    config = {
        unid:{},
        frontmatter: {},
        template: {}
    };
    cache = {
        title: {},
        frontmatter: {},
        content: ""
    };

    //Initialization
	constructor(tp)
	{
		this.config.prompt = "Title";
		this.config.renameNote = true;
		this.config.trailingSpaces = true;
		this.config.titleScheme = "xti";
		this.config.unid = {
			type: "datetime",
			format: "YYYYMMDDHHmm",
			separator: "@"
		};
		this.config.frontmatter = {
			unid: true,
			alias: true,
			created: true,
			title: true,
			datetag: true,
			template: true,
		};
		this.config.template= {
			trigger: "=",
			separator: "-"
		};
        
        this.#templater = tp;
	}

    // Private methods

    #setSeparator(){
        let separatorSpace = "";
    
        if (this.config.trailingSpaces){
            separatorSpace = " ";
        } else {
            separatorSpace = "";
        };
    
        this.config.separatorSpace = separatorSpace;
    }

    #isFrontMatter(){
        const yamlSection = app.metadataCache.getFileCache(this.#templater.config.active_file);
        return ((yamlSection.sections != undefined) && yamlSection.sections[0].type == "yaml")
    }

    #isUNID(){
        const cachedFrontMatter = app.metadataCache.getFileCache(this.#templater.config.active_file).frontmatter;
        return !((cachedFrontMatter == undefined) || (cachedFrontMatter.unid == undefined && cachedFrontMatter.UNID == undefined) || (cachedFrontMatter.UNID == null && cachedFrontMatter.unid == null));
    }

    #getUNID(){
        let titleI ="";

        switch(this.config.unid.type){
            case "datetime":
                if(this.#templater.frontmatter.created==undefined){// || (this.#templater.frontmatter.created) != "object"){
                    titleI = this.#templater.date.now(this.config.unid.format);
                }else{
                    let rH =(Math.floor(Math.random()*24)).toString();
                    let rM= (Math.floor(Math.random()*60)).toString();
       
                    titleI = this.#templater.frontmatter.created.substring(0,4) + this.#templater.frontmatter.created.substring(5,7) + this.#templater.frontmatter.created.substring(8,10) + (rH.length==1?"0":"") + rH + (rM.length==1?"0":"") + rM;
                }
                break;
            default:
                console.log("AutoTemplate: UNID type not defined");
        };
    
            this.cache.title.index = titleI;
            this.cache.frontmatter.unid = titleI;
            this.cache.frontmatter.datetag = titleI.substring(0,4) + "-" + titleI.substring(4,6) + "-" + titleI.substring(6,8);
            this.cache.frontmatter.created = titleI.substring(0,4) + "-" + titleI.substring(4,6) + "-" + titleI.substring(6,8);
    }

    async #getTitle(){
        let titleN = this.cache.title.note;
        let noteFileTitle = this.#templater.file.title;
        let noteContent = await app.vault.read(this.#templater.config.active_file);

        if (noteFileTitle.slice(0,8).toLowerCase() == "untitled")  {
            let titleNote = noteContent.match(/(?:^#|\n#) [ \S]*/g);
            if (titleNote!=null)
            {
                titleN = titleNote[0].split("# ")[1];
            }else{
                titleN = await this.#templater.system.prompt(this.config.prompt);
            }
        } else {
            if (titleN==""){
                titleN = noteFileTitle;
            }
        };

        this.cache.title.note = titleN;
        this.cache.frontmatter.title = titleN;
        this.cache.frontmatter.alias = titleN;
    }

    #setFullTitle(){
        let fileName = "";

        let scheme = this.config.titleScheme;
        let indX= scheme.indexOf("x");
        let indT= scheme.indexOf("t");
        let indI= scheme.indexOf("i");

        for (let i = 0; i < 3; i++) {
            switch (scheme[i]){
                case "t": fileName += this.cache.title.note; break;
                case "x": if(this.cache.title.extension!=""){fileName += (indX>indT ? this.config.separatorSpace +  this.config.template.separator + this.config.separatorSpace : "") + this.cache.title.extension + (indX<indT ? this.config.separatorSpace +  this.config.template.separator + this.config.separatorSpace : "")}; break;
                case "i": fileName += (indI>indT ? this.config.separatorSpace + this.config.unid.separator + this.config.separatorSpace : "") + this.cache.title.index + (indI<indT ? this.config.separatorSpace + this.config.unid.separator + this.config.separatorSpace : ""); break;
            }
        }

        this.cache.title.full = fileName;
    }

    async #renameNote(){      
        if (this.config.renameNote){
            await this.#templater.file.rename(this.cache.title.full);
        } else {
            console.log("autoTemplate: Note file rename postponed: " + this.cache.title.note);
        }
    }

    async #getTemplate(){
        //Resolving trigger
        let noteTitle = this.#templater.file.title;
        let posT = noteTitle.indexOf(this.config.template.trigger);
        let titleX = "";
        let titleN = "";
        let template = "";
        let content = "";
    
        if (posT!=-1){
            let prefT = noteTitle.substring(0,posT);
            let i = 0;
            let foundT = false;
    
            while (this.#triggers[i] && !foundT){
                foundT = (this.#triggers[i].prefix == prefT);
                if (!foundT){
                    i++;
                }
            };
    
            if (foundT){
                titleX = this.#triggers[i].description;
                titleN = noteTitle.substring(posT+1);
                
                // the function below does not work - unless specified full path
                //let foundNT = await this.#templater.file.exists(this.#triggers[i].file);
    
                let foundNT = true;
                
                if(foundNT)
                {
                    template = this.#triggers[i].file;
                    content = await this.#templater.file.include("[[" + template + "]]");
                }
            }else{
                console.error("AutoTemplate: Unindentified template prefix");
            }
        }else{
            content = await this.#getFrontMatter();
        }
    
    
        this.cache.title.extension = titleX;
        this.cache.title.note = titleN;
        this.cache.frontmatter.template = template;
        this.cache.content = content;
        
    }

    async #getFrontMatter(){
        let fmScheme = /---\s*[\s\S]*?\s*---/g;
        let file = await app.vault.read(this.#templater.config.active_file);
        if (file.match(fmScheme).length==2){
            return "";
        }else{
            return file.match(fmScheme)[0];
        };
    }

    #formatFrontMatter(){

        const fmScheme = /---\s*[\s\S]*?\s*---/;
        let cachedMetadata=this.cache.content.match(fmScheme)[0];
    
        if (this.config.frontmatter.unid) {cachedMetadata = changeMetadata(cachedMetadata,"unid",this.cache.frontmatter.unid)};
        if (this.config.frontmatter.alias) {cachedMetadata = changeMetadata(cachedMetadata,"aliases",this.cache.frontmatter.alias)};
        if (this.config.frontmatter.created) {cachedMetadata = changeMetadata(cachedMetadata,"created",this.cache.frontmatter.created)};
        if (this.config.frontmatter.title) {cachedMetadata = changeMetadata(cachedMetadata,"title",this.cache.frontmatter.title)};
        if (this.config.frontmatter.datetag) {cachedMetadata = changeMetadata(cachedMetadata,"tags",this.cache.frontmatter.datetag)};
        if (this.config.frontmatter.template && this.cache.frontmatter.template!="") {cachedMetadata = changeMetadata(cachedMetadata,"template",this.cache.frontmatter.template)};
        
        this.cache.content = this.cache.content.replace(fmScheme,cachedMetadata);
    }

    // Public methods

	addTrigger(prefix, description, file){
		this.#triggers[this.#triggers.length] = {
			prefix: prefix,
			description: description,
			file: file
			};
	}

    async apply(){

        let processedFile = this.#isFrontMatter() && !(this.#isUNID());
        let triggeredFile = this.#templater.file.title.indexOf(this.config.template.trigger)!=-1


        if (processedFile || triggeredFile){

            this.#getUNID();
            await this.#getTemplate();
            await this.#getTitle();

            
            this.#setSeparator();
            this.#setFullTitle();
    
            this.#formatFrontMatter();
            await this.#renameNote();
        }


        return  this.cache.content;
    }

}
