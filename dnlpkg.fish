
if [ ! -d $argv[2] ]
    rm -f dnl.tar.gz
    rm -rf dnl
    mkdir -p dnl
    wget $argv[1] -O dnl.tar.gz
    tar -xvf dnl.tar.gz --strip-components=1 -C dnl
    mv dnl $argv[2]
    rm -f dnl.tar.gz
    rm -rf dnl
    echo "completed download "$argv[2] 1>&2
else
    echo "already downloaded "$argv[2] 1>&2
end
