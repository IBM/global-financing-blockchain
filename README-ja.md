[![Build Status](https://travis-ci.org/IBM/global-financing-blockchain.svg?branch=master)](https://travis-ci.org/IBM/global-financing-blockchain)

# Global financing with blockchain

ブロックチェーンテクノロジを使用したグローバルファイナンスアプリケーションは、購入者、販売者、プロバイダ、荷送人、および金融会社など、ネットワークのさまざまなメンバーによる注文に対するアクションを追跡します。 これらのアクションは次のとおりです。

* バイヤーが注文を作成します
* 売り手は商品の提供元に連絡します
* 荷送人は商品を配達します
* 金融会社は売り手への支払いを処理します

このユースケースは商品購入などに伴い揉め事が発生した際の解決に対処でき、業界のあらゆる分野に適用できます。
ここではBob DillによるRedBookチュートリアル [use case](https://www.redbooks.ibm.com/Redbooks.nsf/RedbookAbstracts/crse0401.html?Open) より、同じアプリケーションインターフェースを使用しています。 このユースケースでは、Node.jsスマートコントラクトとNode.js Webアプリケーションを使用しています。

このCode Patternは、IBM Blockchain Platform Extension for VS Codeを使用してNode.jsスマートコントラクトをパッケージ化する方法を示しています。 次に、この拡張機能を使用して、Hyperledger Fabricネットワークのローカルインスタンスをセットアップし、その上にコントラクトをインストールしてインスタンス化できます。 Node.js Webアプリケーションは、 'fabric-network' sdkを使用してネットワークと対話できます。

このCode Patternを一通り完成させると、以下のことが理解できます。

* Node.jsスマートコントラクトの開発
* VS Code用 IBM Blockchain Platform Extensionを使用し、スマートコントラクトをパッケージ化した、Hyperledger Fabric ローカルインスタンスへのデプロイ
* デプロイされたFabricネットワークとやり取りするためのNode.jsブロックチェーンWebアプリケーションの開発

**Note: 注：スマートコントラクトを代わりにIBM Blockchain Platform（IBM Cloud上）にデプロイするには、この [コードパターン](https://developer.ibm.com/patterns/build-a-global-finance-application-on-blockchain/) に従ってください.**



## アーキテクチャフロー

<p align="center">
  <img src="https://user-images.githubusercontent.com/8854447/72633938-7ead0f00-3927-11ea-94af-7043d1c6ad53.png">
</p>

VS Code用のIBM Blockchain Platform Extensionを使用して、以下のことを行います。

1. スマートコントラクトをパッケージ化します。
1. ローカルのHyperledger Fabric Networkを起動します。
1. ピアノードにチェーンコードをインストールします。
1. ピアノードでチェーンコードをインスタンス化します。
1. Global Financeアプリケーションを使って、 `fabric-network` npmライブラリを使ったAPI呼び出しを通してHyperledger Fabricネットワークとやり取りします。管理者はアプリケーションを使用して新しい参加者を作成することもできます。


## 含まれるコンポーネント

* [IBM Blockchain Platform Extension for VS Code](https://marketplace.visualstudio.com/items?itemName=IBMBlockchain.ibm-blockchain-platform)  は、Hyperledger Fabric環境への接続を含む、スマートコントラクトの開発、テスト、および展開を支援するように設計されています。
* [Hyperledger Fabric v1.4](https://hyperledger-fabric.readthedocs.io) は、高度な機密性、回復力、柔軟性、およびスケーラビリティを提供するモジュラーアーキテクチャーに支えられた分散型元帳ソリューションのプラットフォームです。
* [Visual Studio Code](https://code.visualstudio.com/download) は、最新のWebおよびクラウドアプリケーションの構築およびデバッグ用に再定義および最適化されたコードエディタです。


## 注目のテクノロジー

+ [Node.js](https://nodejs.org/en/) は、サーバーサイドのJavaScriptコードを実行する、オープンソースのクロスプラットフォームのJavaScriptランタイム環境です。
+ [Bootstrap](https://getbootstrap.com/) は、HTML、CSS、およびJavaScriptで開発するためのオープンソースのツールキットです。


## アプリケーションの実行

このコードパターンを設定して実行するには、次の手順に従います。 ステップの詳細は以下のとおりです。


### 前提条件

下記 [IBM Blockchain Platform Extension for VS Code](https://github.com/IBM-Blockchain/blockchain-vscode-extension/blob/master/README.md#requirements) の要件に従う必要があります:

- [VSCode version 1.38.0 or greater](https://code.visualstudio.com)
- [Node v8.x or v10.x and npm v6.x or greater](https://nodejs.org/en/download/)
- [Docker version v17.06.2-ce or greater](https://www.docker.com/get-docker)
- [Docker Compose v1.14.0 or greater](https://docs.docker.com/compose/install/)


### ステップ

1. [Clone the repo](#1-clone-the-repo)
2. [Use the VS Code extension to set up a smart contract on a basic Fabric network](#2-use-the-vs-code-extension-to-set-up-a-smart-contract-on-a-basic-fabric-network)
3. [Run the application](#3-run-the-application)


## 1. リポジトリのクローン

任意のフォルダにリポジトリをCloneします:

```
git clone https://github.com/IBM/global-financing-blockchain.git
```


## 2. VS Code extension を使用して、基本的なFabricネットワークにスマートコントラクトを設定する

Visual Studio Code を開き `contract` フォルダを開きます。


### スマートコントラクトをパッケージ化する

VS Codeの他のオプションを見るために `F1` キーを押してください。
その中から `IBM Blockchain Platform: Package Open Project` を選択します。

<p align="center">
  <img src="https://user-images.githubusercontent.com/8854447/71910509-05036d00-3140-11ea-8b15-7c8aeb403974.png">
</p>

左側の `IBM Blockchain Platform` 拡張ボタンをクリックしてください。 これにより、パッケージ化されたコントラクトが一番上に表示され、ブロックチェーン接続が一番下に表示されます。

<p align="center">
  <img height="500" src="https://user-images.githubusercontent.com/8854447/72377051-0f43df00-36dd-11ea-8e54-93c1d21f1853.png">
</p>


### ローカルでファブリックを設定する

`LOCAL FABRIC OPS` のメニューをクリックし `Start Fabric Runtime` を選択してネットワークを起動します。 これにより、ローカルのFabric設定に必要なDockerイメージがダウンロードされ、ネットワークが起動します。 ネットワークが設定されると、出力ウィンドウが表示されます。
エディターの左側に `FABRIC ENVIRONMENTS` が表示されます。 このセクションの下に `Local Fabric` が表示されます。 それをクリックして、ローカルファブリックを起動します。

<p align="center">
  <img height="500" src="https://user-images.githubusercontent.com/8854447/72295829-54f1a080-3626-11ea-8977-7dafef591eb6.png">
</p>

拡張機能は、ネットワーク内のノードとして機能するDockerコンテナーをプロビジョニングします。 プロビジョニングが完了し、ネットワークが稼働すると、スマートコントラクトをインストールしてインスタンス化するオプション、 `Channels` の情報、 `Nodes` の下のピア、そして `Organizations` の下の organization msp が表示されます。 これで、スマートコントラクトをインストールする準備ができました。

<p align="center">
  <img height="500" src="https://user-images.githubusercontent.com/8854447/72297496-0ba35000-362a-11ea-9f37-e5819b0dd751.png">
</p>


### スマートコントラクトをインストールしてインスタンス化する

#### インストール

*下部にある `FABRIC ENVIRONMENTS` セクションで、 `Smart Contracts` > `Installed` > `+ Install` をクリックします。 次の図のようなポップアップが表示されます。

<p align="center">
  <img width="500" src="https://user-images.githubusercontent.com/8854447/72640815-a9529400-3936-11ea-9257-f021aa8438c5.png">
</p>

*次に、パッケージ化されたコントラクトを選択します：`globalfinancing@0.0.1 Packaged` **注** 0.0.1は、 `package.json` からです。　Line: ` "version"： "0.0.1" `

インストールが完了すると、 `Successfully installed on peer peer0.org1.example.com` というメッセージが表示されます。 また、contractが `FABRIC ENVIRONMENTS` の下の `Installed` の下にリストされていることを確認してください。

<p align="center">
  <img width="300" src="https://user-images.githubusercontent.com/8854447/72640898-d737d880-3936-11ea-9d60-ad6629c148e6.png">
</p>

#### インスタンス化

* **Smart Contracts** の下に、 **Instantiated** というセクションが表示されます。 その下の `+ Instantiate` をクリックします。

* Extensionは、インスタンス化するコントラクトとバージョンを尋ねます。 `globalfinancing@0.0.1 Installed` を選択します。

<p align="center">
  <img width="500" src="https://user-images.githubusercontent.com/8854447/72640977-03ebf000-3937-11ea-8945-dc9e53ded253.png">
</p>

* Extensionは、インスタンス化時に呼び出す関数を尋ねます。 `instantiate` と入力します

<p align="center">
  <img width="500" width="300" src="https://user-images.githubusercontent.com/8854447/72641008-149c6600-3937-11ea-9598-43004c3d8b76.png">
</p>

* 次に、関数の引数を尋ねます。 ここでは引数は不要なので、何も入力せずにエンターキーを押してください。

<p align="center">
  <img width="500" src="https://user-images.githubusercontent.com/8854447/72641072-43b2d780-3937-11ea-8cbc-ab4e757367d1.png">
</p>

* 次に、Extensionは、プライベートデータコレクションの構成ファイルを提供するかどうかを尋ねます。 `No` をクリックします。

<p align="center">
  <img width="500" src="https://user-images.githubusercontent.com/8854447/72641080-4a414f00-3937-11ea-8f2b-37b85090fd6c.png">
</p>

* 最後に、Extensionはスマートコントラクトのエンドースメントポリシーを選択するかどうかを尋ねます。 `Default (single endorser, any org)` を選択します。

<p align="center">
  <img width="500" src="https://user-images.githubusercontent.com/8854447/72641101-53322080-3937-11ea-89f8-4db2f23a8b27.png">
</p>

コントラクトのインスタンス化が完了すると、 `Successfully instantiated smart contract` というメッセージが表示され、 `FABRIC ENVIRONMENTS` の下の `Instantiated` の下に `globalfinancing@0.0.1` が表示されます。

<p align="center">
  <img width="300" src="https://user-images.githubusercontent.com/8854447/72641288-c63b9700-3937-11ea-85cf-ceae22ffcf85.png">
</p>


### CAノードにIdentityを追加する

ここで、CA（認証局）ノードを使用してidentityを作成します。 アプリケーションを認証して実行するには、identity情報とキーファイルが必要です。

左側のペインの `FABRIC ENVIRONMENTS` セクションで、 `Nodes` を展開し、 `ca.org1.example.com` を右クリックします。 `Create Identity（register and enroll）` を選択します。

<p align="center">
  <img width="500" src="https://user-images.githubusercontent.com/8854447/72641326-e53a2900-3937-11ea-84a6-785f11a6cbe6.png">
</p>

表示された入力ボックスに `User1@org1.example.com` を入力しEnterを押します。

<p align="center">
  <img width="500" src="https://user-images.githubusercontent.com/8854447/72641663-a3f64900-3938-11ea-823a-2021c7860f63.png">
</p>

Extensionは、このidentityに属性を追加するかどうかを尋ねます。 `No` をクリックします。

<p align="center">
  <img width="500" src="https://user-images.githubusercontent.com/8854447/72641770-e455c700-3938-11ea-8358-ada659c4b26a.png">
</p>

Once the identity is successfully created, you should get the message `Successfully created identity 'User1@org1.example.com'`. You can now see `User1@org1.example.com` in the `FABRIC WALLETS` section under `Local Fabric Wallet`.
identityが正常に作成されると、 `Successfully created identity 'User1@org1.example.com'` というメッセージが表示されます。 これで、 `Local Fabric Wallet` の下の `FABRIC WALLETS` セクションに `User1@org1.example.com` が表示されます。

<p align="center">
  <img width="300" src="https://user-images.githubusercontent.com/8854447/72641825-03ecef80-3939-11ea-9e1e-70bf3b88242e.png">
</p>


### Walletをエクスポートする

`FABRIC WALLETS` の下で、 `Local Fabric Wallet` を右クリックし、 `Export Wallet` を選択します。

<p align="center">
  <img width="300" src="https://user-images.githubusercontent.com/8854447/72641899-31399d80-3939-11ea-86ff-3e1de927416d.png">
</p>

エクスポート先は任意の場所で結構です。 

エクスポートされたディレクトリから、 `User1 @ org1.example.com` のフォルダを、このリポジトリを複製したディレクトリ内の次の場所にコピーします。

  ```
  /global-financing-blockchain/web-app/controller/restapi/features/fabric/_idwallet/User1@org1.example.com
  ```

<p align="center">
  <img width="500" src="https://user-images.githubusercontent.com/8854447/72642245-e5d3bf00-3939-11ea-9deb-e7a68c5aec41.png">
</p>

これでアプリケーションを実行する準備が整いました。


## 3. アプリケーションの実行

新しいターミナルで `web-app` ディレクトリへ移動します:

  ```bash
  cd global-financing-blockchain/web-app/
  ```

  Build the node dependencies:
  ```bash
  npm install
  ```

  Run the application:
  ```bash
  npm start
  ```

<div style='border: 2px solid #f00;'>
  <img width="1000" src="https://user-images.githubusercontent.com/8854447/72450728-d5c8ad80-3788-11ea-83c4-1f0cf1c8e432.png">
</div>

Unified member's view:
<div style='border: 2px solid #f00;'>
  <img width="1000" src="https://user-images.githubusercontent.com/8854447/72450727-d5c8ad80-3788-11ea-8b40-549187431d33.png">
</div>


## トラブルシューティング

* もしこのようなエラーが発生した場合:
`error: [Remote.js]: Error: Failed to connect before the deadline URL:grpc://localhost:17051
error: [Network]: _initializeInternalChannel: Unable to initialize channel. Attempted to contact 1 Peers. Last error was Error: Failed to connect before the deadline URL:grpc://localhost:17051`

このエラーは、connection.jsonファイルでオーダー/認証局/ peerに使用されているポートが、VS Code用のIBM Blockchain Platform Extensionのsettings.jsonファイルでデフォルトのポートとして指定されているものと同じではないために発生したものです。settings.jsonファイルに指定されているものと一致するように、connection.jsonファイル内のポートを更新する必要があります。

左端にある歯車アイコンのボタンをクリックし、`Settings`を選択します。左側のナビゲーションパネル内の`Extensions`が展開され、"Settings"タブが新しく開き、`Blockchain configuration`を選択します。`Edit in settings.json`をクリックしてBlockchain platform extension用のsettings.jsonファイルを開きます。次のような内容が記載されていることが確認できると思います:
```
{
    "ibm-blockchain-platform.fabric.runtime": {
        "ports": {
            "orderer": 17053,
            "peerRequest": 17057,
            "peerChaincode": 17058,
            "peerEventHub": 17059,
            "certificateAuthority": 17060,
            "couchDB": 17061,
            "logs": 17062
        },
        "developmentMode": false
    },
    "ibm-blockchain-platform.fabric.wallets": [],
    "ibm-blockchain-platform.fabric.gateways": []
}
```

あなたのプロジェクト用のconnection.jsonファイルの中のorderer、peerそしてCAポートをこのsettings.jsonファイルで指定された `orderer`、` peerRequest`そして `certificateAuthority`ポートに置き換えてください。


## このCode Patternの拡張
このアプリケーションは、いくつかの方法で拡張できます。
* すべてのメンバーのためのWalletを作成し、アプリケーションと対話するためにメンバーのWalletを使用してください。
* IBM Cloud上のIBM Blockchain Platformスターター・プランを通じて対話するようにアプリケーションを更新します。


## 関連リンク
* [Hyperledger Fabric Docs](http://hyperledger-fabric.readthedocs.io/en/latest/)
* [Zero to Blockchain](https://www.redbooks.ibm.com/Redbooks.nsf/RedbookAbstracts/crse0401.html?Open)
* [IBM Code Patterns for Blockchain](https://developer.ibm.com/patterns/category/blockchain/)


## ライセンス
このCode Patternは、Apache Software License、Version 2の下でライセンスされています。このCode Pattern内で呼び出される個別のサードパーティコードオブジェクトは、それぞれのプロバイダによって、独自の個別のライセンスに従ってライセンスされています。
Contributions are subject to the [Developer Certificate of Origin, Version 1.1 (DCO)](https://developercertificate.org/) and the [Apache Software License, Version 2](https://www.apache.org/licenses/LICENSE-2.0.txt).

[Apache Software License (ASL) FAQ](https://www.apache.org/foundation/license-faq.html#WhatDoesItMEAN)
