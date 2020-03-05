import { NonTerminal, Production, SymbolWrapper, EOF, ParsingTable, Goto, Shift, Accept, Reduce } from "@parser-generator/definition"
import { FactorNode, EntryNode, EntriesNode, ObjectNode, ItemsNode, ArrayNode, JSONNode } from "./ast"
import { NUMBER, STRING, BOOLEAN, NULL } from "./lexer"

/****************************************
Grmmar
****************************************/

let S = new NonTerminal("S")
let factor = new NonTerminal("factor")
let entry = new NonTerminal("entry")
let entries = new NonTerminal("entries")
let obj = new NonTerminal("obj")
let items = new NonTerminal("items")
let array = new NonTerminal("array")
let json = new NonTerminal("json")
/* (0) S->json */
let p0 = new Production(0,S,[
	new SymbolWrapper(json)],undefined,undefined)
/* (1) factor->array<%(e)=> new FactorNode(e)%> */
let p1 = new Production(1,factor,[
	new SymbolWrapper(array)],undefined, (e)=> new FactorNode(e) )
/* (2) factor->obj<%(e)=> new FactorNode(e)%> */
let p2 = new Production(2,factor,[
	new SymbolWrapper(obj)],undefined, (e)=> new FactorNode(e) )
/* (3) factor->STRING<%(e)=> new FactorNode(e)%> */
let p3 = new Production(3,factor,[
	new SymbolWrapper(STRING)],undefined, (e)=> new FactorNode(e) )
/* (4) factor->NUMBER<%(e)=> new FactorNode(e)%> */
let p4 = new Production(4,factor,[
	new SymbolWrapper(NUMBER)],undefined, (e)=> new FactorNode(e) )
/* (5) factor->-NUMBER<%(e)=> new FactorNode(e)%> */
let p5 = new Production(5,factor,[
	new SymbolWrapper("-"),
	new SymbolWrapper(NUMBER)],undefined, (e)=> new FactorNode(e) )
/* (6) factor->BOOLEAN<%(e)=> new FactorNode(e)%> */
let p6 = new Production(6,factor,[
	new SymbolWrapper(BOOLEAN)],undefined, (e)=> new FactorNode(e) )
/* (7) factor->NULL<%(e)=> new FactorNode(e)%> */
let p7 = new Production(7,factor,[
	new SymbolWrapper(NULL)],undefined, (e)=> new FactorNode(e) )
/* (8) entry->STRING:factor<%(e)=>new EntryNode(e)%> */
let p8 = new Production(8,entry,[
	new SymbolWrapper(STRING),
	new SymbolWrapper(":"),
	new SymbolWrapper(factor)],undefined, (e)=>new EntryNode(e) )
/* (9) entries->entry,entries<%(e)=>new EntriesNode(e)%> */
let p9 = new Production(9,entries,[
	new SymbolWrapper(entry),
	new SymbolWrapper(","),
	new SymbolWrapper(entries)],undefined, (e)=>new EntriesNode(e) )
/* (10) entries->entry<%(e)=>new EntriesNode(e)%> */
let p10 = new Production(10,entries,[
	new SymbolWrapper(entry)],undefined, (e)=>new EntriesNode(e) )
/* (11) entries->entry,<%(e)=>new EntriesNode(e)%> */
let p11 = new Production(11,entries,[
	new SymbolWrapper(entry),
	new SymbolWrapper(",")],undefined, (e)=>new EntriesNode(e) )
/* (12) obj->{entries}<%(e)=>new ObjectNode(e)%> */
let p12 = new Production(12,obj,[
	new SymbolWrapper("{"),
	new SymbolWrapper(entries),
	new SymbolWrapper("}")],undefined, (e)=>new ObjectNode(e) )
/* (13) obj->{entries}<%(e)=>new ObjectNode(e)%> */
let p13 = new Production(13,obj,[
	new SymbolWrapper("{"),
	new SymbolWrapper(entries),
	new SymbolWrapper("}")],undefined, (e)=>new ObjectNode(e) )
/* (14) items->factor,items<%(e)=>new ItemsNode(e)%> */
let p14 = new Production(14,items,[
	new SymbolWrapper(factor),
	new SymbolWrapper(","),
	new SymbolWrapper(items)],undefined, (e)=>new ItemsNode(e) )
/* (15) items->factor<%(e)=>new ItemsNode(e)%> */
let p15 = new Production(15,items,[
	new SymbolWrapper(factor)],undefined, (e)=>new ItemsNode(e) )
/* (16) items->factor,<%(e)=>new ItemsNode(e)%> */
let p16 = new Production(16,items,[
	new SymbolWrapper(factor),
	new SymbolWrapper(",")],undefined, (e)=>new ItemsNode(e) )
/* (17) array->[items]<%(e)=>new ArrayNode(e)%> */
let p17 = new Production(17,array,[
	new SymbolWrapper("["),
	new SymbolWrapper(items),
	new SymbolWrapper("]")],undefined, (e)=>new ArrayNode(e) )
/* (18) array->[items]<%(e)=>new ArrayNode(e)%> */
let p18 = new Production(18,array,[
	new SymbolWrapper("["),
	new SymbolWrapper(items),
	new SymbolWrapper("]")],undefined, (e)=>new ArrayNode(e) )
/* (19) json->factor<%(e)=>new JSONNode(e)%> */
let p19 = new Production(19,json,[
	new SymbolWrapper(factor)],undefined, (e)=>new JSONNode(e) )
S.prods=[p0]
factor.prods=[p1,p2,p3,p4,p5,p6,p7]
entry.prods=[p8]
entries.prods=[p9,p10,p11]
obj.prods=[p12,p13]
items.prods=[p14,p15,p16]
array.prods=[p17,p18]
json.prods=[p19]

/****************************************
 
LR TABLE

****************************************/

let table = new ParsingTable()
table.put(0,json,new Goto(1))
table.put(0,factor,new Goto(2))
table.put(0,array,new Goto(3))
table.put(0,obj,new Goto(4))
table.put(0,STRING,new Shift(5))
table.put(0,NUMBER,new Shift(6))
table.put(0,"-",new Shift(7))
table.put(0,BOOLEAN,new Shift(8))
table.put(0,NULL,new Shift(9))
table.put(0,"[",new Shift(10))
table.put(0,"{",new Shift(11))
table.put(1,EOF,new Accept())
table.put(2,EOF,new Reduce(p19))
table.put(3,EOF,new Reduce(p1))
table.put(4,EOF,new Reduce(p2))
table.put(5,EOF,new Reduce(p3))
table.put(6,EOF,new Reduce(p4))
table.put(7,NUMBER,new Shift(12))
table.put(8,EOF,new Reduce(p6))
table.put(9,EOF,new Reduce(p7))
table.put(10,items,new Goto(13))
table.put(10,factor,new Goto(14))
table.put(10,array,new Goto(15))
table.put(10,obj,new Goto(16))
table.put(10,STRING,new Shift(17))
table.put(10,NUMBER,new Shift(18))
table.put(10,"-",new Shift(19))
table.put(10,BOOLEAN,new Shift(20))
table.put(10,NULL,new Shift(21))
table.put(10,"[",new Shift(22))
table.put(10,"{",new Shift(23))
table.put(11,entries,new Goto(24))
table.put(11,entry,new Goto(25))
table.put(11,STRING,new Shift(26))
table.put(12,EOF,new Reduce(p5))
table.put(13,"]",new Shift(27))
table.put(14,",",new Shift(28))
table.put(14,"]",new Reduce(p15))
table.put(15,",",new Reduce(p1))
table.put(15,"]",new Reduce(p1))
table.put(16,",",new Reduce(p2))
table.put(16,"]",new Reduce(p2))
table.put(17,",",new Reduce(p3))
table.put(17,"]",new Reduce(p3))
table.put(18,",",new Reduce(p4))
table.put(18,"]",new Reduce(p4))
table.put(19,NUMBER,new Shift(29))
table.put(20,",",new Reduce(p6))
table.put(20,"]",new Reduce(p6))
table.put(21,",",new Reduce(p7))
table.put(21,"]",new Reduce(p7))
table.put(22,items,new Goto(30))
table.put(22,factor,new Goto(14))
table.put(22,array,new Goto(15))
table.put(22,obj,new Goto(16))
table.put(22,STRING,new Shift(17))
table.put(22,NUMBER,new Shift(18))
table.put(22,"-",new Shift(19))
table.put(22,BOOLEAN,new Shift(20))
table.put(22,NULL,new Shift(21))
table.put(22,"[",new Shift(22))
table.put(22,"{",new Shift(23))
table.put(23,entries,new Goto(31))
table.put(23,entry,new Goto(25))
table.put(23,STRING,new Shift(26))
table.put(24,"}",new Shift(32))
table.put(25,",",new Shift(33))
table.put(25,"}",new Reduce(p10))
table.put(26,":",new Shift(34))
table.put(27,EOF,new Reduce(p18))
table.put(28,items,new Goto(35))
table.put(28,"]",new Reduce(p16))
table.put(28,factor,new Goto(14))
table.put(28,array,new Goto(15))
table.put(28,obj,new Goto(16))
table.put(28,STRING,new Shift(17))
table.put(28,NUMBER,new Shift(18))
table.put(28,"-",new Shift(19))
table.put(28,BOOLEAN,new Shift(20))
table.put(28,NULL,new Shift(21))
table.put(28,"[",new Shift(22))
table.put(28,"{",new Shift(23))
table.put(29,",",new Reduce(p5))
table.put(29,"]",new Reduce(p5))
table.put(30,"]",new Shift(36))
table.put(31,"}",new Shift(37))
table.put(32,EOF,new Reduce(p13))
table.put(33,entries,new Goto(38))
table.put(33,"}",new Reduce(p11))
table.put(33,entry,new Goto(25))
table.put(33,STRING,new Shift(26))
table.put(34,factor,new Goto(39))
table.put(34,array,new Goto(40))
table.put(34,obj,new Goto(41))
table.put(34,STRING,new Shift(42))
table.put(34,NUMBER,new Shift(43))
table.put(34,"-",new Shift(44))
table.put(34,BOOLEAN,new Shift(45))
table.put(34,NULL,new Shift(46))
table.put(34,"[",new Shift(47))
table.put(34,"{",new Shift(48))
table.put(35,"]",new Reduce(p14))
table.put(36,",",new Reduce(p18))
table.put(36,"]",new Reduce(p18))
table.put(37,",",new Reduce(p13))
table.put(37,"]",new Reduce(p13))
table.put(38,"}",new Reduce(p9))
table.put(39,",",new Reduce(p8))
table.put(39,"}",new Reduce(p8))
table.put(40,",",new Reduce(p1))
table.put(40,"}",new Reduce(p1))
table.put(41,",",new Reduce(p2))
table.put(41,"}",new Reduce(p2))
table.put(42,",",new Reduce(p3))
table.put(42,"}",new Reduce(p3))
table.put(43,",",new Reduce(p4))
table.put(43,"}",new Reduce(p4))
table.put(44,NUMBER,new Shift(49))
table.put(45,",",new Reduce(p6))
table.put(45,"}",new Reduce(p6))
table.put(46,",",new Reduce(p7))
table.put(46,"}",new Reduce(p7))
table.put(47,items,new Goto(50))
table.put(47,factor,new Goto(14))
table.put(47,array,new Goto(15))
table.put(47,obj,new Goto(16))
table.put(47,STRING,new Shift(17))
table.put(47,NUMBER,new Shift(18))
table.put(47,"-",new Shift(19))
table.put(47,BOOLEAN,new Shift(20))
table.put(47,NULL,new Shift(21))
table.put(47,"[",new Shift(22))
table.put(47,"{",new Shift(23))
table.put(48,entries,new Goto(51))
table.put(48,entry,new Goto(25))
table.put(48,STRING,new Shift(26))
table.put(49,",",new Reduce(p5))
table.put(49,"}",new Reduce(p5))
table.put(50,"]",new Shift(52))
table.put(51,"}",new Shift(53))
table.put(52,",",new Reduce(p18))
table.put(52,"}",new Reduce(p18))
table.put(53,",",new Reduce(p13))
table.put(53,"}",new Reduce(p13))

export default table