Tools
=====

Various scripts and tools that might prove helpful to others.

Most of the tools are created for working with Parse (http://www.parse.com)
and Unity3D, so you probably won't find these helpful if you're not using
one or both of these :)

Additionally, as of now, all our development machines are running OS X so
many of these scripts may only work in that environment. We're happy to accept
pull requests for modifications to make them cross-platform.

How to Use
==========

This repo is intended to be included as a Git submodule in side other repos,
living at `supermodule/tools/`. The scripts are written such that they will
read from configuration files found in `supermodule/etc/`, and while common
templates can be found in `supermodule/tools/etc/`, those files will never
actually be used by the scripts.

Tool Run-down
=============
* `build-unity` [BASH]
  This script executes a build script that lives inside your Unity project.
  Currently has some parts that are iOS specific, but easily modified.
* configure-app [JavaScript]
  Handy script for deploying one Parse project to multiple environments.
* copy-hooks [BASH]
  Script to install pre- & post-commit hooks into git. There are a some
  sample pre-commit hooks included that I have found useful for keeping
  Unity & Parse projects a little more sane.
* ensure-unity-is-closed
  Does what it says on the box. Used by pre-commit hooks to help ensure file
  integrity.
* setup-repo
  Sets up pre-commit hooks.
