# SilverBullet plug for saying filetree to the user

A well behaved plug that will greet your users.

## Wait, SilverBullet?

If you don't know what it is, check its [webpage](https://silverbullet.md), but if
you want me to spoil the fun: it is an extensible note taking app with markdown and plain files at its core
(well... there is a bit of magic in there too, but what good it would be without a little magic?)

## Development

1. Run these two commands in separate terminals

```bash
make run
make plug-watch
```

2. Then open your browser to http://localhost:3000
3. Use `cmd-shift-p` to reload the plugin
4. Use `cmd-shift-e` to toggle filetree

## Build

To build this plug, make sure you have `plugos-bundle` installed. If not, be sure to have [Deno](https:pwd//deno.land) installed first, then run:

```shell
deno install -f -A --unstable --importmap https://deno.land/x/silverbullet/import_map.json https://deno.land/x/silverbullet/plugos/bin/plugos-bundle.ts
```

After this, build the plug with

```shell
deno task build
```

Or to watch for changes and rebuild automatically

```shell
deno task watch
```

Then, load the locally built plug, add it to your `PLUGS` note with an absolute path, for instance:

```
- file:/Users/you/path/to/filetree.plug.json
```

And run the `Plugs: Update` command in SilverBullet.

## Installation

If you would like to install this plug straight from Github, make sure you have the `.json` file committed to the repo and simply add

```
- github:user/plugname/plugname.plug.json
```

to your `PLUGS` file, run `Plugs: Update` command and off you go!

## What's with all that Lone Ranger quotes

Don't you know that the [Lone Ranger used silver bullets to solve all the problems](https://en.wikipedia.org/wiki/Silver_bullet#Lone_Ranger)?
