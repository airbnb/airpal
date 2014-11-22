/**
* PL/SQL patterns
*
* @author Ray Myers
* @version 1.0.0
*/
Rainbow.extend( "plsql", [
  {
    name: "constant",
    pattern: /\b(false|null|true)\b/gi
  },
  {
    // see http://docs.oracle.com/javase/tutorial/java/nutsandbolts/_keywords.html
    name: "keyword",
//	An attempt at listing the most common keywords. Add to this as needed.     
    pattern: /\b(select|from|insert|update|package|as|procedure|xmltype|function|return|varchar|varchar2|char|number|long|float|double|integer|int|date|timestamp|out|body|rowtype|values|into|nextval|begin|end|table|type|loop|constant|exception|pragma|exception_init|is|not|while|then|else|raise|others|when|delete|merge|union|commit|rollback|clob|if|elsif|join|using|set|values|sysdate|inner|outer|exists|distinct|sequence|on|matched|where|and|rownum|boolean|default|count|cursor|for|in)\b/gi
  },
  {
    name: "string",
    pattern: /'([^']|(''))*'/g
  },
  {
    name: "number",
  	pattern: /\b[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?\b/g
  },
  {
    name: "comment",
    pattern: /\/\*[\s\S]*?\*\/|(--).*?$/gm
  },
  {
    name: "operator",
    pattern: /(\+{1,2}|-{1,2}|~|!|\*|\/|%|(?:&lt;){1,2}|(?:&gt;){1,3}|(?:&amp;){1,2}|\^|\|{1,2}|\?|:|(?:=|!|\+|-|\*|\/|%|\^|\||:=|(?:&lt;){1,2}|(?:&gt;){1,3})?=)/g
  }
], true );
