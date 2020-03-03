import { NonTerminal, Production, SymbolWrapper, EOF, ParsingTable, Goto, Shift, Accept, Reduce } from "@parser-generator/definition"
import { FactorNode, EntryNode, EntriesNode, ObjectNode, ItemsNode, ArrayNode, JSONNode } from "./ast"
import { NUMBER, STRING, BOOLEAN, NULL } from "./lexer"

let S = new NonTerminal("S")
let factor = new NonTerminal("factor")
let entry = new NonTerminal("entry")
let entries = new NonTerminal("entries")
let obj = new NonTerminal("obj")
let items = new NonTerminal("items")
let array = new NonTerminal("array")
let json = new NonTerminal("json")

/* (0) S->json */
let p0 = new Production(0, S, [
	new SymbolWrapper(json)], undefined, undefined)
/* (1) factor->array<%(e)=> new FactorNode(e)%> */
let p1 = new Production(1, factor, [
	new SymbolWrapper(array)], undefined, (e) => new FactorNode(e))
/* (2) factor->obj<%(e)=> new FactorNode(e)%> */
let p2 = new Production(2, factor, [
	new SymbolWrapper(obj)], undefined, (e) => new FactorNode(e))
/* (3) factor->STRING<%(e)=> new FactorNode(e)%> */
let p3 = new Production(3, factor, [
	new SymbolWrapper(STRING)], undefined, (e) => new FactorNode(e))
/* (4) factor->NUMBER<%(e)=> new FactorNode(e)%> */
let p4 = new Production(4, factor, [
	new SymbolWrapper(NUMBER)], undefined, (e) => new FactorNode(e))
/* (5) factor->BOOLEAN<%(e)=> new FactorNode(e)%> */
let p5 = new Production(5, factor, [
	new SymbolWrapper(BOOLEAN)], undefined, (e) => new FactorNode(e))
/* (6) factor->NULL<%(e)=> new FactorNode(e)%> */
let p6 = new Production(6, factor, [
	new SymbolWrapper(NULL)], undefined, (e) => new FactorNode(e))
/* (7) entry->STRING:factor<%(e)=>new EntryNode(e)%> */
let p7 = new Production(7, entry, [
	new SymbolWrapper(STRING),
	new SymbolWrapper(":"),
	new SymbolWrapper(factor)], undefined, (e) => new EntryNode(e))
/* (8) entries->entry,entries<%(e)=>new EntriesNode(e)%> */
let p8 = new Production(8, entries, [
	new SymbolWrapper(entry),
	new SymbolWrapper(","),
	new SymbolWrapper(entries)], undefined, (e) => new EntriesNode(e))
/* (9) entries->entry<%(e)=>new EntriesNode(e)%> */
let p9 = new Production(9, entries, [
	new SymbolWrapper(entry)], undefined, (e) => new EntriesNode(e))
/* (10) entries->entry,<%(e)=>new EntriesNode(e)%> */
let p10 = new Production(10, entries, [
	new SymbolWrapper(entry),
	new SymbolWrapper(",")], undefined, (e) => new EntriesNode(e))
/* (11) obj->{entries}<%(e)=>new ObjectNode(e)%> */
let p11 = new Production(11, obj, [
	new SymbolWrapper("{"),
	new SymbolWrapper(entries),
	new SymbolWrapper("}")], undefined, (e) => new ObjectNode(e))
/* (12) obj->{entries}<%(e)=>new ObjectNode(e)%> */
let p12 = new Production(12, obj, [
	new SymbolWrapper("{"),
	new SymbolWrapper(entries),
	new SymbolWrapper("}")], undefined, (e) => new ObjectNode(e))
/* (13) items->factor,items<%(e)=>new ItemsNode(e)%> */
let p13 = new Production(13, items, [
	new SymbolWrapper(factor),
	new SymbolWrapper(","),
	new SymbolWrapper(items)], undefined, (e) => new ItemsNode(e))
/* (14) items->factor<%(e)=>new ItemsNode(e)%> */
let p14 = new Production(14, items, [
	new SymbolWrapper(factor)], undefined, (e) => new ItemsNode(e))
/* (15) items->factor,<%(e)=>new ItemsNode(e)%> */
let p15 = new Production(15, items, [
	new SymbolWrapper(factor),
	new SymbolWrapper(",")], undefined, (e) => new ItemsNode(e))
/* (16) array->[items]<%(e)=>new ArrayNode(e)%> */
let p16 = new Production(16, array, [
	new SymbolWrapper("["),
	new SymbolWrapper(items),
	new SymbolWrapper("]")], undefined, (e) => new ArrayNode(e))
/* (17) array->[items]<%(e)=>new ArrayNode(e)%> */
let p17 = new Production(17, array, [
	new SymbolWrapper("["),
	new SymbolWrapper(items),
	new SymbolWrapper("]")], undefined, (e) => new ArrayNode(e))
/* (18) json->factor<%(e)=>new JSONNode(e)%> */
let p18 = new Production(18, json, [
	new SymbolWrapper(factor)], undefined, (e) => new JSONNode(e))
S.prods = [p0]
factor.prods = [p1, p2, p3, p4, p5, p6]
entry.prods = [p7]
entries.prods = [p8, p9, p10]
obj.prods = [p11, p12]
items.prods = [p13, p14, p15]
array.prods = [p16, p17]
json.prods = [p18]
let table = new ParsingTable()
table.put(0, json, new Goto(1))
table.put(0, factor, new Goto(2))
table.put(0, array, new Goto(3))
table.put(0, obj, new Goto(4))
table.put(0, STRING, new Shift(5))
table.put(0, NUMBER, new Shift(6))
table.put(0, BOOLEAN, new Shift(7))
table.put(0, NULL, new Shift(8))
table.put(0, "[", new Shift(9))
table.put(0, "{", new Shift(10))
table.put(1, EOF, new Accept())
table.put(2, EOF, new Reduce(p18))
table.put(3, EOF, new Reduce(p1))
table.put(4, EOF, new Reduce(p2))
table.put(5, EOF, new Reduce(p3))
table.put(6, EOF, new Reduce(p4))
table.put(7, EOF, new Reduce(p5))
table.put(8, EOF, new Reduce(p6))
table.put(9, items, new Goto(11))
table.put(9, factor, new Goto(12))
table.put(9, array, new Goto(13))
table.put(9, obj, new Goto(14))
table.put(9, STRING, new Shift(15))
table.put(9, NUMBER, new Shift(16))
table.put(9, BOOLEAN, new Shift(17))
table.put(9, NULL, new Shift(18))
table.put(9, "[", new Shift(19))
table.put(9, "{", new Shift(20))
table.put(10, entries, new Goto(21))
table.put(10, entry, new Goto(22))
table.put(10, STRING, new Shift(23))
table.put(11, "]", new Shift(24))
table.put(12, ",", new Shift(25))
table.put(12, "]", new Reduce(p14))
table.put(13, ",", new Reduce(p1))
table.put(13, "]", new Reduce(p1))
table.put(14, ",", new Reduce(p2))
table.put(14, "]", new Reduce(p2))
table.put(15, ",", new Reduce(p3))
table.put(15, "]", new Reduce(p3))
table.put(16, ",", new Reduce(p4))
table.put(16, "]", new Reduce(p4))
table.put(17, ",", new Reduce(p5))
table.put(17, "]", new Reduce(p5))
table.put(18, ",", new Reduce(p6))
table.put(18, "]", new Reduce(p6))
table.put(19, items, new Goto(26))
table.put(19, factor, new Goto(12))
table.put(19, array, new Goto(13))
table.put(19, obj, new Goto(14))
table.put(19, STRING, new Shift(15))
table.put(19, NUMBER, new Shift(16))
table.put(19, BOOLEAN, new Shift(17))
table.put(19, NULL, new Shift(18))
table.put(19, "[", new Shift(19))
table.put(19, "{", new Shift(20))
table.put(20, entries, new Goto(27))
table.put(20, entry, new Goto(22))
table.put(20, STRING, new Shift(23))
table.put(21, "}", new Shift(28))
table.put(22, ",", new Shift(29))
table.put(22, "}", new Reduce(p9))
table.put(23, ":", new Shift(30))
table.put(24, EOF, new Reduce(p17))
table.put(25, items, new Goto(31))
table.put(25, "]", new Reduce(p15))
table.put(25, factor, new Goto(12))
table.put(25, array, new Goto(13))
table.put(25, obj, new Goto(14))
table.put(25, STRING, new Shift(15))
table.put(25, NUMBER, new Shift(16))
table.put(25, BOOLEAN, new Shift(17))
table.put(25, NULL, new Shift(18))
table.put(25, "[", new Shift(19))
table.put(25, "{", new Shift(20))
table.put(26, "]", new Shift(32))
table.put(27, "}", new Shift(33))
table.put(28, EOF, new Reduce(p12))
table.put(29, entries, new Goto(34))
table.put(29, "}", new Reduce(p10))
table.put(29, entry, new Goto(22))
table.put(29, STRING, new Shift(23))
table.put(30, factor, new Goto(35))
table.put(30, array, new Goto(36))
table.put(30, obj, new Goto(37))
table.put(30, STRING, new Shift(38))
table.put(30, NUMBER, new Shift(39))
table.put(30, BOOLEAN, new Shift(40))
table.put(30, NULL, new Shift(41))
table.put(30, "[", new Shift(42))
table.put(30, "{", new Shift(43))
table.put(31, "]", new Reduce(p13))
table.put(32, ",", new Reduce(p17))
table.put(32, "]", new Reduce(p17))
table.put(33, ",", new Reduce(p12))
table.put(33, "]", new Reduce(p12))
table.put(34, "}", new Reduce(p8))
table.put(35, ",", new Reduce(p7))
table.put(35, "}", new Reduce(p7))
table.put(36, ",", new Reduce(p1))
table.put(36, "}", new Reduce(p1))
table.put(37, ",", new Reduce(p2))
table.put(37, "}", new Reduce(p2))
table.put(38, ",", new Reduce(p3))
table.put(38, "}", new Reduce(p3))
table.put(39, ",", new Reduce(p4))
table.put(39, "}", new Reduce(p4))
table.put(40, ",", new Reduce(p5))
table.put(40, "}", new Reduce(p5))
table.put(41, ",", new Reduce(p6))
table.put(41, "}", new Reduce(p6))
table.put(42, items, new Goto(44))
table.put(42, factor, new Goto(12))
table.put(42, array, new Goto(13))
table.put(42, obj, new Goto(14))
table.put(42, STRING, new Shift(15))
table.put(42, NUMBER, new Shift(16))
table.put(42, BOOLEAN, new Shift(17))
table.put(42, NULL, new Shift(18))
table.put(42, "[", new Shift(19))
table.put(42, "{", new Shift(20))
table.put(43, entries, new Goto(45))
table.put(43, entry, new Goto(22))
table.put(43, STRING, new Shift(23))
table.put(44, "]", new Shift(46))
table.put(45, "}", new Shift(47))
table.put(46, ",", new Reduce(p17))
table.put(46, "}", new Reduce(p17))
table.put(47, ",", new Reduce(p12))
table.put(47, "}", new Reduce(p12))

export default table