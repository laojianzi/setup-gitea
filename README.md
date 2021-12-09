# setup-gitea

The missing action for Gitea

- Works on Linux, Mac, and Windows
- Supports different versions

### ENV Setting

ref: https://docs.gitea.io/en-us/environment-variables/

### Action Input

```yml
    steps:
    - uses: actions/checkout@v2
    - uses: laojianzi/setup-gitea@v1
      with:
        gitea-version: latest
        args: --version
```

#### gitea-version

version of gitea to use in form of v1.2 or v1.2.3 or `latest` to use the latest version

#### args

gitea command line arguments

