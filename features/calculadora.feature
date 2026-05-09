# language: pt
Funcionalidade: Calculadora
  Como usuario da calculadora
  Quero realizar operacoes matematicas pela interface grafica
  Para conferir o resultado exibido no visor

  Contexto:
    Dado que a calculadora esta aberta

  Cenario: Exibir zero ao iniciar
    Entao o visor deve mostrar "0"

  Cenario: Somar dois numeros
    Quando eu faco a operacao "2 + 3 ="
    Entao o visor deve mostrar "5"

  Cenario: Subtrair dois numeros
    Quando eu faco a operacao "9 - 4 ="
    Entao o visor deve mostrar "5"

  Cenario: Multiplicar dois numeros
    Quando eu faco a operacao "6 * 7 ="
    Entao o visor deve mostrar "42"

  Cenario: Dividir dois numeros
    Quando eu faco a operacao "8 / 2 ="
    Entao o visor deve mostrar "4"

  Cenario: Somar numeros decimais
    Quando eu faco a operacao "1,5 + 2,5 ="
    Entao o visor deve mostrar "4"

  Cenario: Impedir divisao por zero
    Quando eu faco a operacao "5 / 0 ="
    Entao o visor deve mostrar "Erro"

  Cenario: Limpar a calculadora
    Quando eu faco a operacao "7 + 2"
    E eu clico no botao "AC"
    Entao o visor deve mostrar "0"
